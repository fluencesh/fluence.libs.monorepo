import {
    BlockchainListener,
    BlockchainService,
    EthereumContractSubscriptionService,
    JobService,
    ProjectService,
    Scheme,
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
        this.webhookService =
            pluginManager.getServiceByClass(WebhookActionItemObjectService) as WebhookActionItemObjectService;
    }

    public getJobId() {
        return `${blockchainId}.${networkId}.transaction.hash.subscription.listener`;
    }

    protected async processBlock(publishedBlockHeight: number, block: EthereumBlock): Promise<void> {
        const logsMap = await this.getLogMapByBlockHeight(block.height);

        const addresses = Object.keys(logsMap);
        const subscriptions = await this.subscriptionService.listBySubscribedAddressesActiveOnly(addresses);

        const projectsIds = subscriptions.map((subscription) => subscription.projectId);
        const projectsMap: Hashtable<Scheme.Project> = await this.getProjectsMapByIds(projectsIds);

        const webhookActions: Array<Scheme.WebhookActionItem> = [];
        const confirmations = publishedBlockHeight - block.height;

        subscriptions.forEach((subscription) => {
            const project = projectsMap[subscription.projectId];
            const log = logsMap[subscription.address];

            const subscribedTopics = log.topics.filter(
                (topic) => subscription.subscribeAllEvents || subscription.subscribedEvents.includes(topic)
            );

            subscribedTopics.forEach((topic) => {
                webhookActions.push({
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
    
                    txHash: log.transactionHash,
    
                    type: Scheme.WebhookTriggerType.EthereumContractEvent,
                    refId: subscription.id,
    
                    eventId: topic,
                    params: {},
    
                    failedCount: 0,
                    lastFailedAt: null,
    
                    fails: [],
    
                    status: Scheme.WebhookReportItemStatus.Created,
    
                    createdAt: new Date()
                } as Scheme.WebhookActionItem);
            });
        });

        if (webhookActions.length) {
            await this.webhookService.fill(webhookActions);
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
        const projects = await Promise.all(ids.map((id) => this.projectService.getByIdActiveOnly(id)));

        const projectsMap: Hashtable<Scheme.Project> = {};
        projects.forEach((project) => {
            projectsMap[project.id] = project;
        });

        return projectsMap;
    }
}
