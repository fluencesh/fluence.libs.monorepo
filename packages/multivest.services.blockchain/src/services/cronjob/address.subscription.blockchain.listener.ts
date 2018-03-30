import {
    Block,
    Hashtable,
    PluginManager,
    Recipient,
    Transaction,
} from '@applicature/multivest.core';

import { BlockchainService } from '@applicature-restricted/multivest.blockchain';

import { Scheme } from '../../types';
import { AddressSubscriptionService } from '../object/address.subscription.service';
import WebHookActionItem = Scheme.WebHookActionItem;
import {JobService} from '../object/job.service';
import {ProjectService} from '../object/project.service';
import { WebhookActionItemObjectService } from '../object/webhook.action.service';
import { PopulatedBlockchainListener } from './blockchain.listener';

interface RecipientAndTx {
    recipient: Recipient;
    tx: Transaction;
}

export class AddressSubscriptionBlockChainListener extends PopulatedBlockchainListener {
    protected subscriptionService: AddressSubscriptionService;
    protected projectService: ProjectService;
    protected webHookService: WebhookActionItemObjectService;

    constructor(
        pluginManager: PluginManager,
        blockchainService: BlockchainService,
        jobService: JobService,
        sinceBlock: number,
        minConfirmation: number
    ) {
        super(pluginManager, blockchainService, jobService, sinceBlock, minConfirmation);

        // @TODO: proejctService
    }

    public getJobId() {
        const blockchainId = this.blockchainService.getBlockchainId();
        const networkId = this.blockchainService.getNetworkId();

        return `${blockchainId}.${networkId}.address.subscription.listener`;
    }

    protected async processBlock(publishedBlockHeight: number, block: Block): Promise<void> {
        // @TODO: track senders, sent tx hashes

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

        const subscriptions = await this.subscriptionService.listBySubscribedAddresses(recipients);

        const webHookActions: Array<WebHookActionItem> = [];

        const projectsMap: Hashtable<Scheme.Project> = {};

        for (const subscription of subscriptions) {
            const confirmations = publishedBlockHeight - block.height;

            let project;

            if (projectsMap.hasOwnProperty(subscription.projectId)) {
                project = projectsMap[subscription.projectId];
            }
            else {
                project = await this.projectService.getById(subscription.projectId);

                projectsMap[subscription.projectId] = project;
            }

            for (const recipientAndTx of recipientsMap[subscription.address]) {
                const recipient = recipientAndTx.recipient;
                const tx = recipientAndTx.tx;

                const params = {
                    amount: recipient.amount
                };

                webHookActions.push({
                    id: null, // auto generate id

                    clientId: subscription.clientId,
                    projectId: subscription.projectId,
                    webHookUrl: null,

                    blockChainId: this.blockchainService.getBlockchainId(), // blockchain id
                    networkId: this.blockchainService.getNetworkId(), // network id

                    blockHash: block.hash,
                    blockHeight: block.height,
                    blockTime: block.time,

                    minConfirmations: subscription.minConfirmations,
                    confirmations,

                    txHash: tx.hash,

                    address: subscription.address,

                    type: Scheme.WebhookTriggerType.Address,
                    refId: subscription.id, // AddressSubscription id or EthereumContractSubscription id

                    eventId: null,
                    params,

                    failedCount: 0,
                    lastFailedAt: null,

                    fails: [],

                    status: Scheme.WebhookReportItemStatus.Created,

                    createdAt: new Date()
                });
            }
        }

        await this.webHookService.fill(webHookActions);

        return;
    }
}
