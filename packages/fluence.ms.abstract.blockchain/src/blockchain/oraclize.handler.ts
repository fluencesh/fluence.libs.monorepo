import { Hashtable, PluginManager } from '@applicature-private/core.plugin-manager';
import { EthereumBlockchainService, EthereumTransaction } from '@applicature-private/fluence.lib.ethereum';
import {
    OraclizeSubscriptionService,
    Scheme,
} from '@applicature-private/fluence.lib.services';
import { set } from 'lodash';
import { EthereumBlockchainHandler } from './ethereum.blockchain.handler';

// TODO: integrate with BlockchainListener
export class OraclizeSubscriptionHandler extends EthereumBlockchainHandler {
    private subscriptionService: OraclizeSubscriptionService;

    constructor(
        pluginManager: PluginManager,
        blockchainService: EthereumBlockchainService
    ) {
        super(pluginManager, blockchainService);

        this.subscriptionService =
            pluginManager.getServiceByClass(OraclizeSubscriptionService) as OraclizeSubscriptionService;
    }

    public async processBlock(lastBlockHeight: number, block: Scheme.BlockchainBlock<EthereumTransaction>) {
        const logs = await this.getLogsByBlockHeight(block.height);

        const eventsList = logs.reduce((events: Array<string>, log) => events.concat(log.topics), []);

        const confirmations = lastBlockHeight - block.height;
        const subscriptions = (await this.subscriptionService.listByEventHashesAndStatus(
            eventsList,
            true
        )).filter((subscription) => subscription.minConfirmations >= confirmations);

        if (!subscriptions.length) {
            return;
        }

        const projectIds = subscriptions.map((subscription) => subscription.projectId);
        const projects = await this.projectService.listByIds(projectIds);
        const projectMap: Hashtable<Scheme.Project> =
            projects.reduce((map, project) => set(map, project.id, project), {});

        const webhookActions: Array<Scheme.WebhookActionItem> = [];

        for (const subscription of subscriptions) {
            const project = projectMap[subscription.projectId];
            const relatedLogs = logs.filter((log) =>
                !!log.topics.find((topic) => topic === subscription.eventHash)
            );

            for (const log of relatedLogs) {
                const decodedData = this.decodeData(subscription.eventInputTypes, log.data);
                const params = { decodedData };
                const webhookAction = this.createWebhook(
                    block,
                    log.transactionHash,
                    project,
                    subscription,
                    confirmations,
                    params,
                    log.address
                );

                if (subscription.minConfirmations > confirmations) {
                    await this.createBlockRecheck(subscription, block, confirmations, webhookAction);
                    continue;
                }

                webhookActions.push(webhookAction);
            }

        }

        if (webhookActions.length) {
            await this.webhookService.fill(webhookActions);
        }
    }

    public getSubscriptionBlockRecheckType() {
        return Scheme.SubscriptionBlockRecheckType.Oraclize;
    }

    protected getWebhookType() {
        return Scheme.WebhookTriggerType.OraclizeSubscription;
    }
}
