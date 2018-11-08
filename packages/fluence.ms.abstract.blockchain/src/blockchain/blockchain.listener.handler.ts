import {
    Hashtable,
    PluginManager,
} from '@applicature/core.plugin-manager';
import {
    BlockchainService,
    ProjectService,
    Scheme,
    SubscriptionBlockRecheckService,
    WebhookActionItemObjectService,
} from '@fluencesh/fluence.lib.services';
import { set } from 'lodash';
import { v1 as generateId } from 'uuid';
import * as logger from 'winston';
import { CronjobMetricService } from '../services';

export abstract class BlockchainListenerHandler<T extends Scheme.BlockchainTransaction = Scheme.BlockchainTransaction> {
    protected readonly pluginManager: PluginManager;

    protected readonly projectService: ProjectService;
    protected readonly webhookService: WebhookActionItemObjectService;
    protected readonly subscriptionBlockRecheckService: SubscriptionBlockRecheckService;

    protected readonly metricService: CronjobMetricService;

    constructor(
        pluginManager: PluginManager,
        metricService?: CronjobMetricService
    ) {
        this.pluginManager = pluginManager;

        this.projectService = pluginManager.getServiceByClass(ProjectService);
        this.webhookService =
            pluginManager.getServiceByClass(WebhookActionItemObjectService);
        this.subscriptionBlockRecheckService =
            pluginManager.getServiceByClass(SubscriptionBlockRecheckService);

        this.metricService = metricService;
    }

    public async execute(
        lastBlockHeight: number,
        block: Scheme.BlockchainBlock<T>,
        transportConnectionSubscription: Scheme.TransportConnectionSubscription,

        blockchainService: BlockchainService<T>
    ): Promise<void> {
        try {
            await this.processBlock(lastBlockHeight, block, transportConnectionSubscription);
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
        block: Scheme.BlockchainBlock<T>,
        transportConnectionSubscription: Scheme.TransportConnectionSubscription
    ): Promise<void>;

    protected async processUnconfirmedBlocks(
        processedBlockHeight: number,
        blockchainService: BlockchainService<T>,
        transportConnectionId: string
    ): Promise<void> {
        let subscriptionBlockRechecks;
        try {
            subscriptionBlockRechecks =
                await this.subscriptionBlockRecheckService.listByBlockHeightAndBlockchainInfoAndType(
                    processedBlockHeight,
                    transportConnectionId,
                    this.getSubscriptionBlockRecheckType()
                );
        } catch (ex) {
            logger.error(`Can't load block rechecks. Reason: ${ ex.message }`);
            throw ex;
        }

        const webhooks: Array<Scheme.WebhookActionItem> = [];
        const failedSubscriptionBlockRechecks: Array<string> = [];
        const succeedSubscriptionBlockRechecks: Array<string> = [];

        await Promise.all(subscriptionBlockRechecks.map(async (subscriptionBlockRecheck) => {
            try {
                const block = await this.loadBlockByHeight(
                    blockchainService,
                    transportConnectionId,
                    subscriptionBlockRecheck.blockHeight
                );
                if (block.hash === subscriptionBlockRecheck.blockHash) {
                    webhooks.push(subscriptionBlockRecheck.webhookActionItem);
                }

                succeedSubscriptionBlockRechecks.push(subscriptionBlockRecheck.id);
            } catch (ex) {
                logger.error(
                    `can't get block [${ subscriptionBlockRecheck.blockHash }]. it will be reloaded in next iteration.`
                );
                failedSubscriptionBlockRechecks.push(subscriptionBlockRecheck.id);

                return;
            }
        }));

        if (webhooks.length) {
            try {
                await this.webhookService.fill(webhooks);
            } catch (ex) {
                logger.error(`creating webhooks in db was failed. `, ex);
            }
        }

        if (failedSubscriptionBlockRechecks.length) {
            try {
                await this.subscriptionBlockRecheckService.incInvokeOnBlockHeightByIds(failedSubscriptionBlockRechecks);
            } catch (ex) {
                logger.error(`incrementing 'invokeOnBlockHeight' was failed. `, ex);
            }
        }

        if (succeedSubscriptionBlockRechecks.length) {
            try {
                await this.subscriptionBlockRecheckService.removeByIds(succeedSubscriptionBlockRechecks);
            } catch (ex) {
                logger.error(`removing 'SubscriptionBlockRecheck' entities was failed. `, ex);
            }
        }
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

        block: Scheme.BlockchainBlock<T>,
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

    protected abstract getWebhookType(): Scheme.WebhookTriggerType;

    protected async createBlockRecheck(
        subscription: Scheme.Subscription,
        transportConnectionId: string,
        block: Scheme.BlockchainBlock<T>,
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
        blockchainService: BlockchainService<T>,
        transportConnectionId: string,
        height: number
    ): Promise<Scheme.BlockchainBlock<T>> {
        logger.debug(`trying to load block [${ height }]`);

        const block = await blockchainService.getBlockByHeight(height, transportConnectionId);

        logger.debug(`Block [${ height }] was successfully loaded`);

        return block;
    }
}
