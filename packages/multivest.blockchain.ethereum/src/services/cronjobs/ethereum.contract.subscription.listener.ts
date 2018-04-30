import {
    BlockchainListener,
    BlockchainService,
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
import { v1 as generateId } from 'uuid';
import { EthereumBlock, EthereumTransactionReceipt } from '../../types';
import { EthereumBlockchainService } from '../blockchain/ethereum';
import { EthereumContractSubscriptionService } from '../objects/ethereum.contract.subscription.service';

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
        const txHashes = block.transactions.map((tx) => tx.hash);
        const txReceiptMap: Hashtable<EthereumTransactionReceipt> = await this.getTxReceiptMapByTxHashes(txHashes);

        const addresses = Object.keys(txReceiptMap).map((key) => txReceiptMap[key].contractAddress);
        const subscriptions = await this.subscriptionService.listBySubscribedAddresses(addresses);

        const projectsIds = subscriptions.map((subscription) => subscription.projectId);
        const projectsMap: Hashtable<Scheme.Project> = await this.getProjectsMapByIds(projectsIds);

        const webhookActions: Array<Scheme.WebhookActionItem> = [];
        const confirmations = publishedBlockHeight - block.height;

        subscriptions.forEach((subscription) => {
            const project = projectsMap[subscription.projectId];
            const receipt = txReceiptMap[subscription.address];

            receipt.logs.forEach((log) => {
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
        });

        if (webhookActions.length) {
            await this.webhookService.fill(webhookActions);
        }

        return;
    }

    private async getTxReceiptMapByTxHashes(txHashes: Array<string>) {
        const txReceipts = await Promise.all(
            txHashes.map((hash) => this.blockchainService.getTransactionReceipt(hash))
        );

        const txReceiptMap: Hashtable<EthereumTransactionReceipt> = {};
        txReceipts.forEach((txReceipt) => {
            txReceiptMap[txReceipt.contractAddress] = txReceipt;
        });

        return txReceiptMap;
    }

    private async getProjectsMapByIds(ids: Array<string>): Promise<Hashtable<Scheme.Project>> {
        const projects = await Promise.all(ids.map((id) => this.projectService.getById(id)));

        const projectsMap: Hashtable<Scheme.Project> = {};
        projects.forEach((project) => {
            projectsMap[project.id] = project;
        });

        return projectsMap;
    }
}
