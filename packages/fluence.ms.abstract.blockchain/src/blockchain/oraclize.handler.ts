import { Hashtable } from '@applicature/core.plugin-manager';
// import { EthereumBlockchainService, EthereumBlock } from '@fluencesh/fluence.lib.ethereum';
import {
    ScBlockchainService,
    Scheme,
    ScBlockchainTransportProvider,
    ManagedScBlockchainTransport,
} from '@fluencesh/fluence.lib.services';
import { set } from 'lodash';
import { EventListenerHandler } from './event.listener.handler';

// TODO: move to separate package
// https://applicature.atlassian.net/browse/FLC-209
export abstract class OraclizeSubscriptionHandler<
    Transaction extends Scheme.BlockchainTransaction,
    Block extends Scheme.BlockchainBlock<Transaction>,
    Provider extends ScBlockchainTransportProvider<Transaction, Block>,
    ManagedBlockchainTransportService extends ManagedScBlockchainTransport<Transaction, Block, Provider>
> extends EventListenerHandler<Transaction, Block, Provider, ManagedBlockchainTransportService> {

    public getHandlerId() {
        return 'oraclize.subscription.handler';
    }

    public async processBlock(
        lastBlockHeight: number,
        block: Block,
        transportConnectionSubscription: Scheme.TransportConnectionSubscription,
        blockchainService: ScBlockchainService<Transaction, Block, Provider, ManagedBlockchainTransportService>
    ) {
        const logs = await this.getLogsByBlockHeight(
            blockchainService,
            transportConnectionSubscription.id,
            block.height
        );

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
