import {
    Hashtable,
    PluginManager,
} from '@applicature/synth.plugin-manager';
import {
    BlockchainService,
    ProjectService,
    Scheme,
    SubscriptionBlockRecheckService,
    WebhookActionItemObjectService,
    BlockchainTransportProvider,
    ManagedBlockchainTransport,
} from '@fluencesh/fluence.lib.services';
import { set } from 'lodash';
import { v1 as generateId } from 'uuid';
import * as logger from 'winston';
import { CronjobMetricService } from '../services';

export abstract class BlockchainListenerHandler<
    Transaction extends Scheme.BlockchainTransaction,
    Block extends Scheme.BlockchainBlock<Transaction>,
    Provider extends BlockchainTransportProvider<Transaction, Block>,
    ManagedBlockchainTransportService extends ManagedBlockchainTransport<Transaction, Block, Provider>
> {
    protected readonly pluginManager: PluginManager;

    protected readonly projectService: ProjectService;
    protected readonly webhookService: WebhookActionItemObjectService;
    protected readonly subscriptionBlockRecheckService: SubscriptionBlockRecheckService;

    protected readonly metricService: CronjobMetricService;

    constructor(pluginManager: PluginManager) {
        this.pluginManager = pluginManager;

        this.projectService = pluginManager.getServiceByClass(ProjectService);
        this.webhookService =
            pluginManager.getServiceByClass(WebhookActionItemObjectService);
        this.subscriptionBlockRecheckService =
            pluginManager.getServiceByClass(SubscriptionBlockRecheckService);

        this.metricService = pluginManager.getServiceByClass(CronjobMetricService);
    }

    public async execute(
        lastBlockHeight: number,
        block: Block,
        transportConnectionSubscription: Scheme.TransportConnectionSubscription,
        blockchainService: BlockchainService<Transaction, Block, Provider, ManagedBlockchainTransportService>
    ): Promise<void> {
        try {
            await this.processBlock(lastBlockHeight, block, transportConnectionSubscription, blockchainService);
        } catch (ex) {
            logger.error(`cant process block [${ block.height }]. Reason: ${ ex.message }`);
            throw ex;
        }

        try {
            await this.processUnconfirmedBlocks(
                block.height,
                blockchainService,
                transportConnectionSubscription.id
            );
        } catch (ex) {
            logger.error(`cant process unconfirmed blocks. Reason: ${ ex.message }`);
            throw ex;
        }
    }

    public abstract getSubscriptionBlockRecheckType(): Scheme.SubscriptionBlockRecheckType;
    public abstract getHandlerId(): string;

    protected abstract async processBlock(
        lastBlockHeight: number,
        block: Block,
        transportConnectionSubscription: Scheme.TransportConnectionSubscription,
        blockchainService: BlockchainService<Transaction, Block, Provider, ManagedBlockchainTransportService>
    ): Promise<void>;

    protected async processUnconfirmedBlocks(
        processedBlockHeight: number,
        blockchainService: BlockchainService<Transaction, Block, Provider, ManagedBlockchainTransportService>,
        transportConnectionId: string
    ): Promise<void> {
        let subscriptionBlockRechecks;
        try {
            subscriptionBlockRechecks =
                await this.subscriptionBlockRecheckService.listOnBlockByTransportAndType(
                    processedBlockHeight,
                    transportConnectionId,
                    this.getSubscriptionBlockRecheckType()
                );
        } catch (ex) {
            logger.error(`Can't load block rechecks. Reason: ${ ex.message }`);
            throw ex;
        }

        await Promise.all(subscriptionBlockRechecks.map(async (subscriptionBlockRecheck) => {
            try {
                const block = await this.loadBlockByHeight(
                    blockchainService,
                    transportConnectionId,
                    subscriptionBlockRecheck.blockHeight
                );
                if (block.hash === subscriptionBlockRecheck.blockHash) {
                    await this.processWebhookBeforeSave(subscriptionBlockRecheck.webhookActionItem);

                    await this.webhookService.createAction(
                        subscriptionBlockRecheck.webhookActionItem.clientId,
                        subscriptionBlockRecheck.webhookActionItem.projectId,
                        subscriptionBlockRecheck.webhookActionItem.blockchainId,
                        subscriptionBlockRecheck.webhookActionItem.networkId,
                        subscriptionBlockRecheck.webhookActionItem.blockHash,
                        subscriptionBlockRecheck.webhookActionItem.blockHeight,
                        subscriptionBlockRecheck.webhookActionItem.blockTime,
                        subscriptionBlockRecheck.webhookActionItem.minConfirmations,
                        subscriptionBlockRecheck.webhookActionItem.confirmations,
                        subscriptionBlockRecheck.webhookActionItem.txHash,
                        subscriptionBlockRecheck.webhookActionItem.address,
                        subscriptionBlockRecheck.webhookActionItem.type,
                        subscriptionBlockRecheck.webhookActionItem.refId,
                        subscriptionBlockRecheck.webhookActionItem.eventId,
                        subscriptionBlockRecheck.webhookActionItem.params
                    );
                }

                await this.subscriptionBlockRecheckService.removeById(subscriptionBlockRecheck.id);
            } catch (ex) {
                logger.error(
                    `can't get block [${ subscriptionBlockRecheck.blockHash }]. it will be reloaded in next iteration.`
                );

                return;
            }
        }));
    }

    protected async loadProjectHashmapByIds(ids: Array<string>): Promise<Hashtable<Scheme.Project>> {
        const projects = await this.projectService.listByIds(ids);
        const projectHashmap: Hashtable<Scheme.Project> = projects.reduce(
            (hashtable, project: Scheme.Project) => set(hashtable, project.id, project),
            {} as Hashtable<Scheme.Project>
        );

        return projectHashmap;
    }

    protected createWebhook(
        blockchainId: string,
        networkId: string,

        block: Block,
        txHash: string,
        project: Scheme.Project,

        subscription: Scheme.Subscription,

        confirmations: number,
        params: any,
        address: string = null
    ) {
        return {
            id: generateId(),

            clientId: project.clientId,
            projectId: project.id,
            webhookUrl: project.webhookUrl,

            blockchainId,
            networkId,

            blockHash: block.hash,
            blockHeight: block.height,
            blockTime: block.time,

            confirmations,
            minConfirmations: subscription.minConfirmations,

            address,
            txHash,

            refId: subscription.id,
            type: this.getWebhookType(),

            params,

            failedCount: 0,
            fails: [],
            lastFailedAt: null,

            status: Scheme.WebhookReportItemStatus.Created,

            createdAt: new Date()
        } as Scheme.WebhookActionItem;
    }

    /**
     * Hook which executes before save webhook in DB. Webhook may be modified here
     */
    protected async processWebhookBeforeSave(webhook: Scheme.WebhookActionItem, extraData?: any): Promise<void> {
        return Promise.resolve();
    }

    protected abstract getWebhookType(): Scheme.WebhookTriggerType;

    protected async createBlockRecheck(
        subscription: Scheme.Subscription,
        transportConnectionId: string,
        block: Block,
        confirmations: number,
        webhook: Scheme.WebhookActionItem
    ): Promise<void> {
        const invokeOnBlockHeight = block.height + subscription.minConfirmations - confirmations;

        await this.subscriptionBlockRecheckService.createBlockRecheck(
            subscription.id,
            transportConnectionId,
            this.getSubscriptionBlockRecheckType(),
            block.hash,
            block.height,
            invokeOnBlockHeight,
            webhook
        );

        return;
    }

    private async loadBlockByHeight(
        blockchainService: BlockchainService<Transaction, Block, Provider, ManagedBlockchainTransportService>,
        transportConnectionId: string,
        height: number
    ): Promise<Block> {
        logger.debug(`trying to load block [${ height }]`);

        const block = await blockchainService.getBlockByHeight(height, transportConnectionId);

        logger.debug(`Block [${ height }] was successfully loaded`);

        return block;
    }
}
