import { Hashtable } from '@applicature-private/core.plugin-manager';
import { EthereumBlockchainService, EthereumBlock } from '@applicature-private/fluence.lib.ethereum';
import {
    Scheme,
} from '@applicature-private/fluence.lib.services';
import { set } from 'lodash';
import { EventListenerHandler } from './event.listener.handler';

// TODO: move to separate package
// https://applicature.atlassian.net/browse/FLC-209
export class OraclizeSubscriptionHandler extends EventListenerHandler {
    public getHandlerId() {
        return 'oraclize.subscription.handler';
    }

    public async processBlock(
        lastBlockHeight: number,
        block: EthereumBlock,
        transportConnectionSubscription: Scheme.TransportConnectionSubscription,
        blockchainService: EthereumBlockchainService
    ) {
        const logs = await this.getLogsByBlockHeight(blockchainService, block.height);

        const eventsList = logs.reduce((events: Array<string>, log) => events.concat(log.topics), []);

        const confirmations = lastBlockHeight - block.height;
        const subscriptions = transportConnectionSubscription.oraclizeSubscriptions
            .filter((s) => s.minConfirmations >= confirmations && eventsList.includes(s.eventHash));

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
                    transportConnectionSubscription.blockchainId,
                    transportConnectionSubscription.networkId,
                    block,
                    log.transactionHash,
                    project,
                    subscription,
                    confirmations,
                    params,
                    log.address
                );

                if (subscription.minConfirmations > confirmations) {
                    await this.createBlockRecheck(
                        subscription,
                        transportConnectionSubscription.id,
                        block,
                        confirmations,
                        webhookAction
                    );
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
