import { Hashtable } from '@applicature-private/core.plugin-manager';
import {
    Scheme,
    BlockchainTransportProvider,
    ManagedBlockchainTransport,
} from '@applicature-private/fluence.lib.services';
import { BlockchainListenerHandler } from './blockchain.listener.handler';

interface RecipientAndTx {
    recipient: Scheme.Recipient;
    tx: Scheme.BlockchainTransaction;
}

export class AddressSubscriptionHandler<
    Transaction extends Scheme.BlockchainTransaction,
    Block extends Scheme.BlockchainBlock<Transaction>,
    Provider extends BlockchainTransportProvider<Transaction, Block>,
    ManagedBlockchainTransportService extends ManagedBlockchainTransport<Transaction, Block, Provider>
> extends BlockchainListenerHandler<Transaction, Block, Provider, ManagedBlockchainTransportService> {

    public getSubscriptionBlockRecheckType() {
        return Scheme.SubscriptionBlockRecheckType.Address;
    }

    public getHandlerId() {
        return 'address.subscription.handler';
    }

    public async processBlock(
        lastBlockHeight: number,
        block: Block,
        transportConnectionSubscription: Scheme.TransportConnectionSubscription
    ) {
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

        const subscriptions = transportConnectionSubscription.addressSubscriptions
            .filter((s) => recipientsMap[s.address] !== undefined);

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
                    transportConnectionSubscription.blockchainId,
                    transportConnectionSubscription.networkId,
                    block,
                    tx.hash,
                    project,
                    subscription,
                    confirmations,
                    params,
                    subscription.address
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

        return;
    }

    protected getWebhookType() {
        return Scheme.WebhookTriggerType.Address;
    }
}
