import { Block, Hashtable, PluginManager, Recipient, Transaction } from '@applicature-private/multivest.core';
import {
    AddressSubscriptionService,
    BlockchainService,
    Scheme,
} from '@applicature-private/multivest.services.blockchain';
import * as logger from 'winston';
import { BlockchainHandler } from './blockchain.handler';

interface RecipientAndTx {
    recipient: Recipient;
    tx: Transaction;
}

export class AddressSubscriptionHandler extends BlockchainHandler {
    private subscriptionService: AddressSubscriptionService;

    constructor(
        pluginManager: PluginManager,
        blockchainService: BlockchainService
    ) {
        super(pluginManager, blockchainService);

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
            await this.webhookService.fill(webhookActions);
        }

        return;
    }

    protected getWebhookType() {
        return Scheme.WebhookTriggerType.Address;
    }
}
