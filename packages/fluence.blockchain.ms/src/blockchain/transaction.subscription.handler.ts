import { Block, Hashtable, PluginManager, Transaction } from '@fluencesh/multivest.core';
import {
    BlockchainService,
    MetricService,
    Scheme,
    TransactionHashSubscriptionService,
} from '@fluencesh/multivest.services.blockchain';
import * as logger from 'winston';
import { BlockchainHandler } from './blockchain.handler';

export class TransactionSubscriptionHandler extends BlockchainHandler {
    private subscriptionService: TransactionHashSubscriptionService;

    constructor(
        pluginManager: PluginManager,
        blockchainService: BlockchainService,
        metricService?: MetricService,
    ) {
        super(pluginManager, blockchainService, metricService);

        this.subscriptionService =
            pluginManager.getServiceByClass(TransactionHashSubscriptionService) as TransactionHashSubscriptionService;
    }

    public getSubscriptionBlockRecheckType() {
        return Scheme.SubscriptionBlockRecheckType.Transaction;
    }

    public async processBlock(lastBlockHeight: number, block: Block) {
        const txMap: Hashtable<Transaction> = {};
        block.transactions.forEach((tx) => {
            txMap[tx.hash] = tx;
        });

        const subscriptions = await this.subscriptionService.listBySubscribedHashesActiveOnly(Object.keys(txMap));

        if (subscriptions.length) {
            const uniqueProjectsIds = subscriptions
                .map((subscription) => subscription.projectId)
                .filter((projectId, index, projectIds) => projectIds.indexOf(projectId) === index);

            const projectsMap: Hashtable<Scheme.Project> = await this.loadProjectHashmapByIds(uniqueProjectsIds);

            const webhookActions: Array<Scheme.WebhookActionItem> = [];

            const confirmations = lastBlockHeight - block.height;

            for (const subscription of subscriptions) {
                const project = projectsMap[subscription.projectId];
                const tx = txMap[subscription.hash];
                const params: any = {};

                const webhook = this.createWebhook(
                    block,
                    tx.hash,
                    project,
                    subscription,
                    confirmations,
                    params,
                );
                if (subscription.minConfirmations > confirmations) {
                    await this.createBlockRecheck(subscription, block, confirmations, webhook);
                    continue;
                }

                webhookActions.push(webhook);
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
        }

        return;
    }

    protected getWebhookType() {
        return Scheme.WebhookTriggerType.Transaction;
    }
}
