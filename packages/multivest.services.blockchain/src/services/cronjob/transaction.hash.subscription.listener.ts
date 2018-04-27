import {
    Block,
    Hashtable,
    PluginManager,
    Transaction,
} from '@applicature/multivest.core';
import { v1 as generateId } from 'uuid';

import { BlockchainService } from '../blockchain/blockchain.service';

import { Scheme } from '../../types';
import WebhookActionItem = Scheme.WebhookActionItem;
import { JobService } from '../object/job.service';
import { ProjectService } from '../object/project.service';
import { TransactionHashSubscriptionService } from '../object/transaction.hash.subscription.service';
import { WebhookActionItemObjectService } from '../object/webhook.action.service';
import { PopulatedBlockchainListener } from './blockchain.listener';

let blockchainId: string;
let networkId: string;

export class TransactionHashSubscriptionListener extends PopulatedBlockchainListener {
    protected subscriptionService: TransactionHashSubscriptionService;
    protected projectService: ProjectService;
    protected webhookService: WebhookActionItemObjectService;

    constructor(
        pluginManager: PluginManager,
        blockchainService: BlockchainService,
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
            pluginManager.getServiceByClass(TransactionHashSubscriptionService) as TransactionHashSubscriptionService;
        this.projectService = pluginManager.getServiceByClass(ProjectService) as ProjectService;
        this.webhookService =
            pluginManager.getServiceByClass(WebhookActionItemObjectService) as WebhookActionItemObjectService;
    }

    public getJobId() {
        return `${blockchainId}.${networkId}.transaction.hash.subscription.listener`;
    }

    protected async processBlock(publishedBlockHeight: number, block: Block): Promise<void> {
        const txMap: Hashtable<Transaction> = {};
        block.transactions.forEach((tx) => {
            txMap[tx.hash] = tx;
        });

        const subscriptions = await this.subscriptionService.listBySubscribedHashes(Object.keys(txMap));

        if (subscriptions.length) {
            const uniqueProjectsIds = subscriptions
                .map((subscription) => subscription.projectId)
                .filter((projectId, index, projectIds) => projectIds.indexOf(projectId) === index);

            const projects = await this.projectService.listByIds(uniqueProjectsIds);
            const projectsMap: Hashtable<Scheme.Project> = {};
            projects.forEach((project) => {
                projectsMap[project.id] = project;
            });

            const webhookActions: Array<WebhookActionItem> = [];

            const confirmations = publishedBlockHeight - block.height;

            subscriptions.forEach((subscription) => {
                const project = projectsMap[subscription.projectId];
                const tx = txMap[subscription.hash];

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

                    txHash: tx.hash,

                    type: Scheme.WebhookTriggerType.Transaction,
                    refId: subscription.id,

                    eventId: null,
                    params: {},

                    failedCount: 0,
                    lastFailedAt: null,

                    fails: [],

                    status: Scheme.WebhookReportItemStatus.Created,

                    createdAt: new Date()
                } as WebhookActionItem);
            });

            await this.webhookService.fill(webhookActions);
        }

        return;
    }
}