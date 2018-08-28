import {
    Block,
    Hashtable,
    PluginManager,
} from '@fluencesh/multivest.core';
import {
    BlockchainService,
    ProjectService,
    Scheme,
    SubscriptionBlockRecheckService,
    WebhookActionItemObjectService,
} from '@fluencesh/multivest.services.blockchain';
import { set } from 'lodash';
import { v1 as generateId } from 'uuid';
import * as logger from 'winston';

export abstract class BlockchainHandler {
    protected pluginManager: PluginManager;

    protected blockchainId: string;
    protected networkId: string;

    protected blockchainService: BlockchainService;

    protected projectService: ProjectService;
    protected webhookService: WebhookActionItemObjectService;
    protected subscriptionBlockRecheckService: SubscriptionBlockRecheckService;

    constructor(
        pluginManager: PluginManager,
        blockchainService: BlockchainService
    ) {
        this.pluginManager = pluginManager;
        this.blockchainService = blockchainService;

        this.blockchainId = this.blockchainService.getBlockchainId();
        this.networkId = this.blockchainService.getNetworkId();

        this.projectService = pluginManager.getServiceByClass(ProjectService) as ProjectService;
        this.webhookService =
            pluginManager.getServiceByClass(WebhookActionItemObjectService) as WebhookActionItemObjectService;
        this.subscriptionBlockRecheckService =
            pluginManager.getServiceByClass(SubscriptionBlockRecheckService) as SubscriptionBlockRecheckService;
    }

    public async processBlockAndUnconfirmedBlocks(
        lastBlockHeight: number,
        block: Block
    ): Promise<void> {
        await this.processBlock(lastBlockHeight, block);
        await this.processUnconfirmedBlocks(block.height);

        return;
    }

    public abstract async processBlock(
        lastBlockHeight: number,
        block: Block
    ): Promise<void>;

    public abstract getSubscriptionBlockRecheckType(): Scheme.SubscriptionBlockRecheckType;

    protected async loadProjectHashmapByIds(ids: Array<string>): Promise<Hashtable<Scheme.Project>> {
        const projects = await this.projectService.listByIds(ids);
        const projectHashmap: Hashtable<Scheme.Project> = projects.reduce(
            (hashtable, project: Scheme.Project) => set(hashtable, project.id, project),
            {} as Hashtable<Scheme.Project>
        );

        return projectHashmap;
    }

    protected createWebhook(
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

            blockChainId: this.blockchainId,
            networkId: this.networkId,

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
        block: Block,
        confirmations: number,
        webhook: Scheme.WebhookActionItem
    ): Promise<void> {
        const invokeOnBlockHeight = block.height + subscription.minConfirmations - confirmations;

        await this.subscriptionBlockRecheckService.createBlockRecheck(
            subscription.id,
            this.blockchainId,
            this.networkId,
            this.getSubscriptionBlockRecheckType(),
            block.hash,
            block.height,
            invokeOnBlockHeight,
            webhook
        );

        return;
    }

    protected async processUnconfirmedBlocks(processedBlockHeight: number): Promise<void> {
        const subscriptionBlockRechecks =
            await this.subscriptionBlockRecheckService.listByBlockHeightAndBlockchainInfoAndType(
                processedBlockHeight,
                this.blockchainId,
                this.networkId,
                this.getSubscriptionBlockRecheckType()
            );

        const webhooks: Array<Scheme.WebhookActionItem> = [];
        const failedSubscriptionBlockRechecks: Array<string> = [];
        const succeedSubscriptionBlockRechecks: Array<string> = [];

        await Promise.all(subscriptionBlockRechecks.map(async (subscriptionBlockRecheck) => {
            try {
                const block = await this.loadBlockByHash(subscriptionBlockRecheck.blockHash);
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

    private async loadBlockByHash(hash: string): Promise<Block> {
        logger.debug(`trying to load block [${ hash }]`);

        const block = await this.blockchainService.getBlockByHash(hash);

        logger.debug(`Block [${ hash }] was successfully loaded`);

        return block;
    }
}
