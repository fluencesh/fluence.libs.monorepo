import { Hashtable } from '@applicature-private/core.plugin-manager';
import {
    Scheme,
} from '@applicature-private/fluence.lib.services';
import { BlockchainListenerHandler } from './blockchain.listener.handler';

export class TransactionSubscriptionHandler extends BlockchainListenerHandler {

    public getSubscriptionBlockRecheckType() {
        return Scheme.SubscriptionBlockRecheckType.Transaction;
    }

    public getHandlerId() {
        return 'transaction.hash.subscription.handler';
    }

    public async processBlock(
        lastBlockHeight: number,
        block: Scheme.BlockchainBlock<Scheme.BlockchainTransaction>,
        transportConnectionSubscription: Scheme.TransportConnectionSubscription
    ) {
        const txMap: Hashtable<Scheme.BlockchainTransaction> = {};
        block.transactions.forEach((tx) => {
            txMap[tx.hash] = tx;
        });

        const subscriptions = transportConnectionSubscription.transactionHashSubscriptions
            .filter((s) => txMap[s.hash] !== undefined);

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
                    transportConnectionSubscription.blockchainId,
                    transportConnectionSubscription.networkId,
                    block,
                    tx.hash,
                    project,
                    subscription,
                    confirmations,
                    params
                );
                if (subscription.minConfirmations > confirmations) {
                    await this.createBlockRecheck(
                        subscription,
                        transportConnectionSubscription.id,
                        block,
                        confirmations,
                        webhook
                    );
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
                            transportConnectionSubscription.blockchainId,
                            transportConnectionSubscription.networkId,
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
