import { PluginManager, Service, Transaction } from '@applicature-private/multivest.core';
import { Plugin as MongoPlugin } from '@applicature-private/multivest.mongodb';
import {
    BlockchainRegistryService,
    ClientService,
    ProjectService,
    ScheduledTxService,
    Scheme,
    TransactionHashSubscriptionService,
    WebhookActionItemObjectService,
} from '@applicature-private/multivest.services.blockchain';
import * as logger from 'winston';

export class ScheduledTxHandlerService extends Service {
    private clientService: ClientService;
    private projectService: ProjectService;
    private scheduledTxService: ScheduledTxService;
    private webhookService: WebhookActionItemObjectService;
    private txSubscriptionService: TransactionHashSubscriptionService;

    private blockchainRegistry: BlockchainRegistryService;

    constructor(pluginManager: PluginManager, blockchainRegistry: BlockchainRegistryService) {
        super(pluginManager);

        this.blockchainRegistry = blockchainRegistry;
    }

    public getServiceId() {
        return 'scheduled.tx.handler.service';
    }

    public async init() {
        this.clientService = await this.pluginManager.getServiceByClass(ClientService);
        this.projectService = await this.pluginManager.getServiceByClass(ProjectService);
        this.scheduledTxService = await this.pluginManager.getServiceByClass(ScheduledTxService);
        this.webhookService = await this.pluginManager.getServiceByClass(WebhookActionItemObjectService);
        this.txSubscriptionService = await this.pluginManager.getServiceByClass(TransactionHashSubscriptionService);
    }

    public async handle(scheduledTxId: string): Promise<void> {
        const scheduledTx = await this.scheduledTxService.getById(scheduledTxId);
        const project = await this.projectService.getById(scheduledTx.projectId);
        const client = await this.clientService.getById(project.id);

        const isProjectActive = project.status === Scheme.ProjectStatus.Active;
        const isClientActive = client.status === Scheme.ClientStatus.Active;
        const subscribed = isProjectActive && isClientActive;

        if (!subscribed) {
            logger.info(
                `Client [${ client.id }] or project [${ project.id }] or both marked as inactive. `
                + 'Tx won\'t be sent'
            );
            return;
        }

        const blockchainService = this.blockchainRegistry.getByBlockchainInfo(
            scheduledTx.blockchainId,
            scheduledTx.networkId
        );
        let tx: Transaction;
        try {
            const privateKey = Buffer.alloc(scheduledTx.privateKey.length, scheduledTx.privateKey, 'utf8');
            // FIXME: type error. Should take `Scheme.BlockchainTransaction`
            tx = await blockchainService.sendTransaction(privateKey, scheduledTx.tx);

            await this.createWebhookAction(
                client.id,
                project.id,
                scheduledTxId,
                scheduledTx.blockchainId,
                scheduledTx.networkId,
                Scheme.ScheduledTxExecutionStatus.SENT,
                tx,
                project.txMinConfirmations
            );
        } catch (ex) {
            logger.error(ex.message);
            await this.createWebhookAction(
                client.id,
                project.id,
                scheduledTxId,
                scheduledTx.blockchainId,
                scheduledTx.networkId,
                Scheme.ScheduledTxExecutionStatus.FAILED,
            );

            return;
        }

        try {
            await this.txSubscriptionService.createSubscription(
                client.id,
                project.id,
                scheduledTx.blockchainId,
                scheduledTx.networkId,
                tx.hash,
                project.txMinConfirmations
            );
        } catch (ex) {
            logger.error(
                `Subscription on tx [${ (tx || { hash: 'tx obj is empty' }).hash }] was not created.`
                + `Reason ${ ex.message }`
            );
        }
    }

    private async createWebhookAction(
        clientId: string,
        projectId: string,
        scheduledTxId: string,
        blockchainId: string,
        networkId: string,
        txSendingStatus: Scheme.ScheduledTxExecutionStatus,
        tx?: Transaction,
        minConfirmations?: number,
    ): Promise<void> {
        const created = await this.webhookService.createAction(
            clientId,
            projectId,
            blockchainId,
            networkId,
            null,
            null,
            null,
            minConfirmations,
            0,
            tx.hash,
            null,
            Scheme.WebhookTriggerType.ScheduledTransaction,
            scheduledTxId,
            null,
            { status: txSendingStatus, tx }
        );

        await this.webhookService.setStatus(created.id, Scheme.WebhookReportItemStatus.Created);

        return;
    }
}
