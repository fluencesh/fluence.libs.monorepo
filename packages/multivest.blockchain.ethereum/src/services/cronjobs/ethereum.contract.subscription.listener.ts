import {
    BlockchainListener,
    BlockchainService,
    ContractService,
    EthereumContractSubscriptionService,
    JobService,
    ProjectService,
    Scheme,
    SubscriptionMetric,
    WebhookActionItemObjectService,
} from '@applicature-restricted/multivest.services.blockchain';
import {
    Block,
    Hashtable,
    PluginManager,
    Transaction,
} from '@applicature/multivest.core';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import * as config from 'config';
import * as abi from 'ethereumjs-abi';
import { sha3 } from 'ethereumjs-util';
import { set } from 'lodash';
import { v1 as generateId } from 'uuid';
import {
    EthereumBlock,
    EthereumTopic,
    EthereumTopicFilter,
    EthereumTransactionReceipt,
} from '../../types';
import { EthereumBlockchainService } from '../blockchain/ethereum';

let blockchainId: string;
let networkId: string;

export class EthereumContractSubscriptionListener extends BlockchainListener {
    protected subscriptionService: EthereumContractSubscriptionService;
    protected projectService: ProjectService;
    protected webhookService: WebhookActionItemObjectService;
    protected contractService: ContractService;
    protected blockchainService: EthereumBlockchainService;

    constructor(
        pluginManager: PluginManager,
        blockchainService: EthereumBlockchainService,
        jobService: JobService,
        sinceBlock: number,
        minConfirmation: number,
        processedBlockHeight: number = 0
    ) {
        // FIXME: bad practice
        blockchainId = blockchainService.getBlockchainId();
        networkId = blockchainService.getNetworkId();

        super(pluginManager, blockchainService, jobService, sinceBlock, minConfirmation, processedBlockHeight);

        this.subscriptionService =
            pluginManager.getServiceByClass(EthereumContractSubscriptionService) as EthereumContractSubscriptionService;
        this.projectService = pluginManager.getServiceByClass(ProjectService) as ProjectService;
        this.contractService = pluginManager.getServiceByClass(ContractService) as ContractService;
        this.webhookService =
            pluginManager.getServiceByClass(WebhookActionItemObjectService) as WebhookActionItemObjectService;
    }

    public getJobId() {
        return `${blockchainId}.${networkId}.transaction.hash.subscription.listener`;
    }

    protected async processBlock(publishedBlockHeight: number, block: EthereumBlock): Promise<void> {
        const logsMap = await this.getLogMapByBlockHeight(block.height);
        
        const addresses = Object.keys(logsMap);
        const contractMap = await this.getContractMapByAddresses(addresses);
        const subscriptions = await this.subscriptionService.listBySubscribedAddressesActiveOnly(addresses);

        const projectsIds = subscriptions.map((subscription) => subscription.projectId);
        const projectsMap: Hashtable<Scheme.Project> = await this.getProjectsMapByIds(projectsIds);

        const webhookActions: Array<Scheme.WebhookActionItem> = [];
        const confirmations = publishedBlockHeight - block.height;

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
                (topic) => subscription.subscribeAllEvents || subscription.subscribedEvents.includes(topic)
            );

            for (const topic of subscribedTopics) {
                const relatedMethod = abiTopicMethodMap[topic];
                let decodedData: Array<string>;
                if (relatedMethod) {
                    const types = relatedMethod.inputs.map((input) => input.type);
                    decodedData = this.parseLogData(log.data, types);
                }

                webhookActions.push(this.prepareWebhookAction(
                    project,
                    block,
                    confirmations,
                    log.transactionHash,
                    topic,
                    subscription,
                    decodedData
                ));
            }
        }

        if (webhookActions.length) {
            await this.webhookService.fill(webhookActions);

            SubscriptionMetric.getInstance().eventFound(webhookActions.length);
        }

        return;
    }

    private async getLogMapByBlockHeight(height: number) {
        const topicFilters = {
            fromBlock: height,
            toBlock: height,
        } as EthereumTopicFilter;

        const logs = await this.blockchainService.getLogs(topicFilters);
        const logsMap: Hashtable<EthereumTopic> = logs.reduce((map, log) => set(map, log.address, log), {});

        return logsMap;
    }

    private async getProjectsMapByIds(ids: Array<string>): Promise<Hashtable<Scheme.Project>> {
        const projects = await this.projectService.listByIdsActiveOnly(ids);

        const projectsMap: Hashtable<Scheme.Project> = {};
        projects.forEach((project) => {
            projectsMap[project.id] = project;
        });

        return projectsMap;
    }

    private async getContractMapByAddresses(addresses: Array<string>): Promise<Hashtable<Scheme.ContractScheme>> {
        const contracts = await this.contractService.listByAddresses(addresses);

        const contractsMap = contracts.reduce(
            (map, contract) => set(map, contract.address, contract),
            {} as Hashtable<Scheme.ContractScheme>
        );

        return contractsMap;
    }

    private prepareWebhookAction(
        project: Scheme.Project,
        block: EthereumBlock,
        confirmations: number,
        txHash: string,
        topic: string,
        subscription: Scheme.EthereumContractSubscription,
        data: Array<string> = null
    ): Scheme.WebhookActionItem {
        return {
            id: generateId(),

            clientId: subscription.clientId,
            projectId: subscription.projectId,
            webhookUrl: project.webhookUrl,

            blockChainId: this.blockchainService.getBlockchainId(),
            networkId: this.blockchainService.getNetworkId(),

            blockHash: block.hash,
            blockHeight: block.height,
            blockTime: block.time,

            minConfirmations: subscription.minConfirmations,
            confirmations,

            txHash,

            type: Scheme.WebhookTriggerType.EthereumContractEvent,
            refId: subscription.id,

            eventId: topic,
            params: { data } as Hashtable<any>,

            failedCount: 0,
            lastFailedAt: null,

            fails: [],

            status: Scheme.WebhookReportItemStatus.Created,

            createdAt: new Date()
        } as Scheme.WebhookActionItem;
    }

    private parseLogData(logData: string, types: Array<string>) {
        return abi.rawDecode(types, Buffer.from(logData, 'utf8'));
    }

    private convertAbiMethodInTopic(abiMethod: Scheme.EthereumContractAbiItem) {
        const types = abiMethod.inputs.map((input) => input.type);
        const eventMethodSignature = `${ abiMethod.name }(${ types.join(',') })`;
        const createContractTopic = this.attachPrefix((sha3(eventMethodSignature) as Buffer).toString('hex'));

        return createContractTopic;
    }

    private attachPrefix(strLine: string) {
        return strLine.indexOf('0x') === 0 ? strLine : `0x${strLine}`;
    }
}
