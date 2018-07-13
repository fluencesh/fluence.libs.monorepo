import {
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
} from '../../types';
import { EthereumBlockchainService } from '../blockchain/ethereum';
import { EthereumBlockchainListener } from './ethereum.blockchain.listener';

export class EthereumContractSubscriptionListener extends EthereumBlockchainListener {
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
        super(pluginManager, blockchainService, jobService, sinceBlock, minConfirmation, processedBlockHeight);

        this.subscriptionService =
            pluginManager.getServiceByClass(EthereumContractSubscriptionService) as EthereumContractSubscriptionService;
        this.projectService = pluginManager.getServiceByClass(ProjectService) as ProjectService;
        this.contractService = pluginManager.getServiceByClass(ContractService) as ContractService;
        this.webhookService =
            pluginManager.getServiceByClass(WebhookActionItemObjectService) as WebhookActionItemObjectService;
    }

    public getJobId() {
        return `${ this.blockchainId }.${ this.networkId }.transaction.hash.subscription.listener`;
    }

    protected async processBlock(publishedBlockHeight: number, block: EthereumBlock): Promise<void> {
        const logsMap = await this.getLogMapByBlockHeight(block.height);
        
        const addresses = Object.keys(logsMap);
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
                    decodedData = this.decodeData(types, log.data);
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

    private async getProjectsMapByIds(ids: Array<string>): Promise<Hashtable<Scheme.Project>> {
        const projects = await this.projectService.listByIdsActiveOnly(ids);

        const projectsMap: Hashtable<Scheme.Project> = {};
        projects.forEach((project) => {
            projectsMap[project.id] = project;
        });

        return projectsMap;
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
}
