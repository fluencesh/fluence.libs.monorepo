import { Hashtable, PluginManager } from '@applicature-private/core.plugin-manager';
import {
    BlockchainService,
    Scheme,
    TransactionHashSubscriptionService,
    BlockchainTransportProvider,
    ManagedBlockchainTransportService,
} from '@applicature-private/fluence.lib.services';
import * as logger from 'winston';
import { CronjobMetricService } from '../services';
import { BlockchainHandler } from './blockchain.handler';

export class TransactionSubscriptionHandler<
    Transaction extends Scheme.BlockchainTransaction,
    Block extends Scheme.BlockchainBlock<Transaction>,
    Provider extends BlockchainTransportProvider<Transaction, Block>,
    ManagedService extends ManagedBlockchainTransportService<Transaction, Block, Provider>,
    BlockchainServiceType extends BlockchainService<Transaction, Block, Provider, ManagedService>
> extends BlockchainHandler<Transaction, Block, Provider, ManagedService, BlockchainServiceType> {
    private subscriptionService: TransactionHashSubscriptionService;

    constructor(
        pluginManager: PluginManager,
        blockchainService: BlockchainServiceType,
        metricService?: CronjobMetricService
    ) {
        super(pluginManager, blockchainService, metricService);

        this.subscriptionService =
            pluginManager.getServiceByClass(TransactionHashSubscriptionService) as TransactionHashSubscriptionService;
    }

    public getSubscriptionBlockRecheckType() {
        return Scheme.SubscriptionBlockRecheckType.Transaction;
    }

    public async processBlock(lastBlockHeight: number, block: Block) {
        const txMap: Hashtable<Scheme.BlockchainTransaction> = {};
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
                    params
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
