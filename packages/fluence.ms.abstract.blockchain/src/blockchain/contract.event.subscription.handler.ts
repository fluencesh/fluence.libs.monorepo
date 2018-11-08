import { Hashtable, PluginManager } from '@applicature/core.plugin-manager';
import { EthereumBlockchainService, EthereumTransaction } from '@fluencesh/fluence.lib.ethereum';
import {
    EthereumContractSubscriptionService,
    Scheme,
} from '@fluencesh/fluence.lib.services';
import { CronjobMetricService } from '@fluencesh/fluence.ms.abstract.blockchain';
import { set } from 'lodash';
import { EthereumBlockchainHandler } from './ethereum.blockchain.handler';

// TODO: integrate with BlockchainListener
export class ContractEventSubscriptionHandler extends EthereumBlockchainHandler {
    private subscriptionService: EthereumContractSubscriptionService;

    constructor(
        pluginManager: PluginManager,
        blockchainService: EthereumBlockchainService,
        metricService: CronjobMetricService,
    ) {
        super(pluginManager, blockchainService, metricService);

        this.subscriptionService =
            pluginManager.getServiceByClass(EthereumContractSubscriptionService) as EthereumContractSubscriptionService;
    }

    public async processBlock(lastBlockHeight: number, block: Scheme.BlockchainBlock<EthereumTransaction>) {
        const logsMap = await this.getLogMapByBlockHeight(block.height);

        const confirmations = lastBlockHeight - block.height;
        const addresses = Object.keys(logsMap);
        const subscriptions = (await this.subscriptionService.listBySubscribedAddressesActiveOnly(addresses))
            .filter((subscription) => subscription.minConfirmations >= confirmations);

        if (subscriptions.length === 0) {
            return;
        }

        const projectsIds = subscriptions.map((subscription) => subscription.projectId);
        const projectsMap: Hashtable<Scheme.Project> = await this.loadProjectHashmapByIds(projectsIds);

        const webhookActions: Array<Scheme.WebhookActionItem> = [];

        for (const subscription of subscriptions) {
            const project = projectsMap[subscription.projectId];
            const log = logsMap[subscription.address];

            const abiTopicMethodMap: Hashtable<Scheme.EthereumContractAbiItem> = subscription
                .abi
                .filter((method) => method.type === 'event')
                .reduce(
                    (map, method) => set(map, this.convertAbiMethodInTopic(method), method),
                    {} as Hashtable<Scheme.EthereumContractAbiItem>
                );

            const subscribedTopics = log.topics.filter(
                (topic: any) => subscription.subscribeAllEvents || subscription.subscribedEvents.includes(topic)
            );

            for (const topic of subscribedTopics) {
                const relatedMethod = abiTopicMethodMap[topic];
                let decodedData: Array<string>;
                if (relatedMethod) {
                    const types = relatedMethod.inputs.map((input) => input.type);
                    decodedData = this.decodeData(types, log.data);
                }

                const params = { decodedData };

                const webhook = this.createWebhook(
                    block,
                    log.transactionHash,
                    project,
                    subscription,
                    confirmations,
                    params,
                    log.address
                );

                if (subscription.minConfirmations > confirmations) {
                    await this.createBlockRecheck(subscription, block, confirmations, webhook);
                    continue;
                }

                webhookActions.push(webhook);
            }
        }

        if (webhookActions.length) {
            const promises = [
                this.webhookService.fill(webhookActions)
            ];

            if (this.metricService) {
                const today = new Date();

                promises.push(
                    this.metricService.addressFoundInBlock(
                        this.blockchainService.getBlockchainId(),
                        this.blockchainService.getNetworkId(),
                        webhookActions.length,
                        today
                    )
                );
            }

            await Promise.all(promises);
        }

        return;
    }

    public getSubscriptionBlockRecheckType(): Scheme.SubscriptionBlockRecheckType {
        return Scheme.SubscriptionBlockRecheckType.ContractEvent;
    }

    protected getWebhookType() {
        return Scheme.WebhookTriggerType.EthereumContractEvent;
    }
}
