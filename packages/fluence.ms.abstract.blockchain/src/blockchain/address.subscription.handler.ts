import { Hashtable, PluginManager } from '@applicature/core.plugin-manager';
import {
    AddressSubscriptionService,
    BlockchainService,
    Scheme,
    BlockchainTransportProvider,
    ManagedBlockchainTransport,
} from '@fluencesh/fluence.lib.services';
import { CronjobMetricService } from '../services';
import { BlockchainHandler } from './blockchain.handler';

interface RecipientAndTx {
    recipient: Scheme.Recipient;
    tx: Scheme.BlockchainTransaction;
}

export class AddressSubscriptionHandler<
    Transaction extends Scheme.BlockchainTransaction,
    Block extends Scheme.BlockchainBlock<Transaction>,
    Provider extends BlockchainTransportProvider<Transaction, Block>,
    ManagedService extends ManagedBlockchainTransport<Transaction, Block, Provider>,
    BlockchainServiceType extends BlockchainService<Transaction, Block, Provider, ManagedService>
> extends BlockchainHandler<Transaction, Block, Provider, ManagedService, BlockchainServiceType> {
    private subscriptionService: AddressSubscriptionService;

    constructor(
        pluginManager: PluginManager,
        blockchainService: BlockchainServiceType,
        metricService?: CronjobMetricService
    ) {
        super(pluginManager, blockchainService, metricService);

        this.subscriptionService =
            pluginManager.getServiceByClass(AddressSubscriptionService) as AddressSubscriptionService;
    }

    public getSubscriptionBlockRecheckType() {
        return Scheme.SubscriptionBlockRecheckType.Address;
    }

    public async processBlock(lastBlockHeight: number, block: Block) {
        const recipients: Array<string> = [];
        const recipientsMap: Hashtable<Array<RecipientAndTx>> = {};
        for (const tx of block.transactions) {
            for (const recipient of tx.to) {
                if (recipients.indexOf(recipient.address) === -1) {
                    recipients.push(recipient.address);

                    recipientsMap[recipient.address] = [];
                }

                recipientsMap[recipient.address].push({
                    recipient, tx
                });
            }
        }

        const subscriptions = await this.subscriptionService.listBySubscribedAddressesActiveOnly(recipients);
        const projectIds = subscriptions.map((s) => s.projectId);
        const projectsMap: Hashtable<Scheme.Project> = await this.loadProjectHashmapByIds(projectIds);
        const webhookActions: Array<Scheme.WebhookActionItem> = [];
        const confirmations = lastBlockHeight - block.height;

        for (const subscription of subscriptions) {
            const project = projectsMap[subscription.projectId];

            for (const recipientAndTx of recipientsMap[subscription.address]) {
                const recipient = recipientAndTx.recipient;
                const tx = recipientAndTx.tx;

                const params = {
                    amount: recipient.amount.toString()
                };

                const webhook = this.createWebhook(
                    block,
                    tx.hash,
                    project,
                    subscription,
                    confirmations,
                    params,
                    subscription.address
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

    protected getWebhookType() {
        return Scheme.WebhookTriggerType.Address;
    }
}
