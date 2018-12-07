import { Hashtable } from '@applicature/synth.plugin-manager';
import {
    ScBlockchainService,
    Scheme,
    ScBlockchainTransportProvider,
    ManagedScBlockchainTransport,
} from '@fluencesh/fluence.lib.services';
import { set } from 'lodash';
import { EventListenerHandler } from './event.listener.handler';

export abstract class ContractEventSubscriptionHandler<
    Transaction extends Scheme.BlockchainTransaction,
    Block extends Scheme.BlockchainBlock<Transaction>,
    Provider extends ScBlockchainTransportProvider<Transaction, Block>,
    ManagedBlockchainTransportService extends ManagedScBlockchainTransport<Transaction, Block, Provider>
> extends EventListenerHandler<Transaction, Block, Provider, ManagedBlockchainTransportService> {

    public getHandlerId() {
        return 'contract.event.subscription.handler';
    }

    public getSubscriptionBlockRecheckType(): Scheme.SubscriptionBlockRecheckType {
        return Scheme.SubscriptionBlockRecheckType.ContractEvent;
    }

    protected async processBlock(
        lastBlockHeight: number,
        block: Block,
        transportConnectionSubscription: Scheme.TransportConnectionSubscription,
        blockchainService: ScBlockchainService<Transaction, Block, Provider, ManagedBlockchainTransportService>
    ) {
        const logsMap = await this.getLogMapByBlockHeight(
            blockchainService,
            transportConnectionSubscription.id,
            block.height
        );

        const confirmations = lastBlockHeight - block.height;
        const addresses = Object.keys(logsMap);
        const subscriptions = transportConnectionSubscription.contractSubscriptions
            .filter((s) => s.minConfirmations <= confirmations && addresses.includes(s.address));

        if (subscriptions.length === 0) {
            return;
        }

        const projectsIds = subscriptions.map((subscription) => subscription.projectId);
        const projectsMap: Hashtable<Scheme.Project> = await this.loadProjectHashmapByIds(projectsIds);

        const webhookActions: Array<Scheme.WebhookActionItem> = [];

        for (const subscription of subscriptions) {
            const project = projectsMap[subscription.projectId];
            const log = logsMap[subscription.address];

            const abiTopicMethodMap: Hashtable<Scheme.EthereumContractAbiItem> = subscription
                .abi
                .filter((method) => method.type === 'event')
                .reduce(
                    (map, method) => set(map, this.convertAbiMethodInTopic(method), method),
                    {} as Hashtable<Scheme.EthereumContractAbiItem>
                );

            const subscribedTopics = log.topics.filter(
                (topic: any) => subscription.subscribeAllEvents || subscription.subscribedEvents.includes(topic)
            );

            for (const topic of subscribedTopics) {
                const relatedMethod = abiTopicMethodMap[topic];
                let decodedData: Array<string>;
                if (relatedMethod) {
                    const types = relatedMethod.inputs.map((input) => input.type);
                    decodedData = this.decodeData(types, log.data);
                }

                const params = { decodedData };

                const webhook = this.createWebhook(
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
                        transportConnectionSubscription.id,
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
        return Scheme.WebhookTriggerType.ContractEvent;
    }
}
