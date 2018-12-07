import { Service } from '@applicature/synth.plugin-manager';
import {
    BlockchainRegistryService,
    ClientService,
    ProjectService,
    ScheduledTxService,
    Scheme,
    TransactionHashSubscriptionService,
    WebhookActionItemObjectService,
    TransportConnectionService,
} from '@fluencesh/fluence.lib.services';
import * as logger from 'winston';

export class ScheduledTxHandlerService extends Service {
    private clientService: ClientService;
    private projectService: ProjectService;
    private scheduledTxService: ScheduledTxService;
    private webhookService: WebhookActionItemObjectService;
    private txSubscriptionService: TransactionHashSubscriptionService;
    private transportConnectionService: TransportConnectionService;

    private blockchainRegistry: BlockchainRegistryService;

    public getServiceId() {
        return 'scheduled.tx.handler.service';
    }

    public async init() {
        this.clientService = this.pluginManager.getServiceByClass(ClientService);
        this.projectService = this.pluginManager.getServiceByClass(ProjectService);
        this.scheduledTxService = this.pluginManager.getServiceByClass(ScheduledTxService);
        this.webhookService = this.pluginManager.getServiceByClass(WebhookActionItemObjectService);
        this.txSubscriptionService = this.pluginManager.getServiceByClass(TransactionHashSubscriptionService);
        this.transportConnectionService = this.pluginManager.getServiceByClass(TransportConnectionService);
        this.blockchainRegistry = this.pluginManager.getServiceByClass(BlockchainRegistryService);
    }

    public async handle(scheduledTxId: string): Promise<void> {
        let scheduledTx: Scheme.ScheduledTx;
        let project: Scheme.Project;
        let client: Scheme.Client;
        let transportConnection: Scheme.TransportConnection;

        try {
            scheduledTx = await this.scheduledTxService.getById(scheduledTxId);

            const projectTransportConnection = await Promise.all([
                this.projectService.getById(scheduledTx.projectId),
                this.transportConnectionService.getById(scheduledTx.transportConnectionId)
            ]);
            project = projectTransportConnection[0];
            transportConnection = projectTransportConnection[1];

            client = await this.clientService.getById(project.id);
        } catch (ex) {
            logger.error(`cant load entities from DB. Reason: ${ ex.message }`);
            return;
        }

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
            transportConnection.blockchainId,
            transportConnection.networkId
        );
        let tx: Scheme.BlockchainTransaction;
        try {
            const privateKey = Buffer.alloc(scheduledTx.privateKey.length, scheduledTx.privateKey, 'utf8');
            tx = await blockchainService.sendTransaction(privateKey, scheduledTx.tx, scheduledTx.transportConnectionId);

            await this.createWebhookAction(
                client.id,
                project.id,
                scheduledTxId,
                transportConnection.blockchainId,
                transportConnection.networkId,
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
                transportConnection.blockchainId,
                transportConnection.networkId,
                Scheme.ScheduledTxExecutionStatus.FAILED
            );

            return;
        }

        try {
            await this.txSubscriptionService.createSubscription(
                client.id,
                project.id,
                scheduledTx.transportConnectionId,
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
        tx?: Scheme.BlockchainTransaction,
        minConfirmations?: number
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
