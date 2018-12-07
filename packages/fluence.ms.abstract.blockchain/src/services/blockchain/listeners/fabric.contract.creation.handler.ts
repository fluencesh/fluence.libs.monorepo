import { Hashtable, PluginManager } from '@applicature/synth.plugin-manager';
import {
    ContractService,
    Scheme,
    ScBlockchainTransportProvider,
    ManagedScBlockchainTransport,
    ScBlockchainService,
} from '@fluencesh/fluence.lib.services';
import { EventListenerHandler } from './event.listener.handler';
import { CronjobMetricService } from '../../metrics';

export abstract class FabricContractCreationHandler<
    Transaction extends Scheme.BlockchainTransaction,
    Block extends Scheme.BlockchainBlock<Transaction>,
    Provider extends ScBlockchainTransportProvider<Transaction, Block>,
    ManagedBlockchainTransportService extends ManagedScBlockchainTransport<Transaction, Block, Provider>
> extends EventListenerHandler<Transaction, Block, Provider, ManagedBlockchainTransportService> {
    private contractService: ContractService;

    constructor(
        pluginManager: PluginManager,
        metricService?: CronjobMetricService
    ) {
        super(pluginManager, metricService);

        this.contractService =
            pluginManager.getServiceByClass(ContractService) as ContractService;
    }

    public async processBlock(
        lastBlockHeight: number,
        block: Block,
        transportConnectionSubscription: Scheme.TransportConnectionSubscription,
        blockchainService: ScBlockchainService<Transaction, Block, Provider, ManagedBlockchainTransportService>
    ) {
        const logs = await this.getLogsByBlockHeight(
            blockchainService,
            transportConnectionSubscription.id,
            block.height
        );

        const receivedContractsAddresses = logs
            .map((log) => log.address)
            .filter((address, index, addresses) => addresses.indexOf(address) === index);
        const contracts = await this.contractService.listByAddresses(receivedContractsAddresses);

        if (contracts.length === 0) {
            return;
        }

        const projectIds = contracts.map((c) => c.projectId);
        const projectsMap: Hashtable<Scheme.Project> = await this.loadProjectHashmapByIds(projectIds);
        
        const webhookActions: Array<Scheme.WebhookActionItem> = [];

        const subscriptionsMap: Hashtable<Scheme.FabricContractCreationSubscription> = {};
        for (const subscription of transportConnectionSubscription.fabricContractCreationSubscriptions) {
            const eventName = this.generateEventName(subscription.methodName, subscription.inputTypes);
            subscriptionsMap[eventName] = subscription;
        }

        const contractMap: Hashtable<Scheme.ContractScheme> = {};
        for (const contract of contracts) {
            contractMap[contract.address] = contract;
        }

        const confirmations = lastBlockHeight - block.height;

        for (const subscription of transportConnectionSubscription.fabricContractCreationSubscriptions) {
            const eventName = this.generateEventName(subscription.methodName, subscription.inputTypes);
            const relatedLogs = logs.filter((log) => log.topics.includes(eventName));

            for (const log of relatedLogs) {
                const contract = contractMap[log.address];

                const decoded = this.decodeData(subscription.inputTypes, log.data);
                const createdContractAddress = this.attachPrefix(decoded[0]);

                const project = projectsMap[contract.projectId];

                const params = {
                    address: createdContractAddress,
                    createdBy: contract.address
                };

                const webhook = this.createWebhook(
                    transportConnectionSubscription.blockchainId,
                    transportConnectionSubscription.networkId,
                    block,
                    log.transactionHash,
                    project,
                    subscription,
                    confirmations,
                    params,
                    log.address
                );

                if (subscription.minConfirmations > confirmations) {
                    await this.createBlockRecheck(
                        subscription,
                        transportConnectionSubscription.id,
                        block,
                        confirmations,
                        webhook
                    );
                } else {
                    await this.processWebhookBeforeSend(webhook, contract);

                    webhookActions.push(webhook);
                }
            }
        }
    }

    public getSubscriptionBlockRecheckType() {
        return Scheme.SubscriptionBlockRecheckType.ContractFabricCreation;
    }

    protected getWebhookType() {
        return Scheme.WebhookTriggerType.ContractEvent;
    }

    protected async processWebhookBeforeSend(webhook: Scheme.WebhookActionItem, contract?: Scheme.ContractScheme) {
        if (!contract) {
            contract = await this.contractService.getByAddress(webhook.params.createdByAddress);
        }

        const createdContract = await this.contractService.createContract(
            contract.projectId,
            webhook.params.address,
            contract.abi
        );

        webhook.params.abi = createdContract.abi;
        webhook.params.id = createdContract.id;
        webhook.params.isFabric = createdContract.isFabric;
        webhook.params.isPublic = createdContract.isPublic;
        webhook.params.projectId = createdContract.projectId;
    }

    /**
     * Should return event hash based on method name and input types of method
     * @example
     * // Ethereum example
     * protected generateEventName(methodName: string, inputTypes: Array<string>): string {
     * // sha3 was got from 'ethereumjs-util';
     * return this.attachPrefix((sha3(`${ methodName }(${ inputTypes.join(',') })`) as Buffer).toString('hex'));
     * }
     */
    protected abstract generateEventName(methodName: string, inputTypes: Array<string>): string;

    private attachPrefix(hex: string): string {
        return hex.indexOf('0x') !== -1 ? hex : `0x${ hex }`;
    }
}
