import { Job, PluginManager, Transaction } from '@applicature-private/multivest.core';
import * as randomstring from 'randomstring';
import * as logger from 'winston';
import { RandomStringPresets } from '../../constants';
import { Scheme } from '../../types';
import { BlockchainService } from '../blockchain/blockchain.service';
import { ClientService } from '../object/client.service';
import { ProjectService } from '../object/project.service';
import { TransactionHashSubscriptionService } from '../object/transaction.hash.subscription.service';
import { WebhookActionItemObjectService } from '../object/webhook.action.service';

const generateId = () => randomstring.generate(RandomStringPresets.Hash256);

export class ScheduledTxJob extends Job {
    private blockchainService: BlockchainService;
    private txSubscriptionService: TransactionHashSubscriptionService;
    private webhookService: WebhookActionItemObjectService;
    private scheduledTx: Scheme.ScheduledTx;
    private project: Scheme.Project;
    private client: Scheme.Client;
    private privateKey: Buffer;
    private jobId: string;

    constructor(pluginManager: PluginManager, blockchainService: BlockchainService, scheduledTx: Scheme.ScheduledTx) {
        super(pluginManager);

        this.blockchainService = blockchainService;
        this.privateKey = Buffer.alloc(scheduledTx.privateKey.length, scheduledTx.privateKey, 'utf8');
        this.scheduledTx = scheduledTx;

        this.txSubscriptionService =
            pluginManager.getServiceByClass(TransactionHashSubscriptionService) as TransactionHashSubscriptionService;
        this.webhookService =
            pluginManager.getServiceByClass(WebhookActionItemObjectService) as WebhookActionItemObjectService;
    }

    /**
     * Fills properties and launch a job
     */
    public async init(): Promise<void> {
        const projectService = this.pluginManager.getServiceByClass(ProjectService) as ProjectService;
        this.project = await projectService.getById(this.scheduledTx.projectId);

        const clientService = this.pluginManager.getServiceByClass(ClientService) as ClientService;
        this.client = await clientService.getById(this.project.clientId);

        this.launchJob();

        await super.init();
    }

    public getJobId(): string {
        this.jobId = this.jobId || `scheduled.tx.job.${ generateId() }`;

        return this.jobId;
    }

    public getScheduledTxId(): string {
        return this.scheduledTx.id;
    }

    public async execute(): Promise<void> {
        const isProjectActive = this.project.status === Scheme.ProjectStatus.Active;
        const isClientActive = this.client.status === Scheme.ClientStatus.Active;
        const subscribed = isProjectActive && isClientActive;

        if (!subscribed) {
            return;
        }

        const webhookAction: Scheme.WebhookActionItem = {
            clientId: this.client.id,
            projectId: this.project.id,

            blockChainId: this.blockchainService.getBlockchainId(),
            networkId: this.blockchainService.getNetworkId(),

            blockHash: null,
            blockHeight: null,
            blockTime: null,

            minConfirmations: this.project.txMinConfirmations,
            confirmations: 0,

            txHash: null,

            address: null,

            type: Scheme.WebhookTriggerType.ScheduledTransaction,
            refId: this.scheduledTx.id,

            eventId: null,
            params: {}
        } as Scheme.WebhookActionItem;

        let tx: Transaction;
        try {
            tx = await this.blockchainService.sendTransaction(this.privateKey, this.scheduledTx.tx);

            webhookAction.txHash = tx.hash;
            webhookAction.params.status = Scheme.ScheduledTxExecutionStatus.SENT;
            webhookAction.params.tx = tx;

            await this.createWebhookAction(webhookAction);
        } catch (ex) {
            logger.error(ex.message);

            webhookAction.params.status = Scheme.ScheduledTxExecutionStatus.FAILED;
            await this.createWebhookAction(webhookAction);

            return;
        }

        await this.txSubscriptionService.createSubscription(
            this.project.clientId,
            this.project.id,
            this.blockchainService.getBlockchainId(),
            this.blockchainService.getNetworkId(),
            tx.hash,
            this.project.txMinConfirmations
        );

        return;
    }

    public async stop(): Promise<void> {
        const agenda = this.pluginManager.getJobExecutor();

        await new Promise((resolve, reject) => {
            agenda.cancel({ name: this.getJobId() }, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });

        return;
    }

    public async changeCronExpression(cronExpression: string): Promise<void> {
        await this.stop();
        this.scheduledTx.cronExpression = cronExpression;
        this.launchJob();

        return;
    }

    public changeTransaction(tx: Transaction): Promise<void> {
        this.scheduledTx.tx = tx;

        return;
    }

    private launchJob(): void {
        const agenda = this.pluginManager.getJobExecutor();
        agenda.every(this.scheduledTx.cronExpression, this.getJobId());

        return;
    }

    private async createWebhookAction(action: Scheme.WebhookActionItem) {
        const created = await this.webhookService.createAction(
            action.clientId,
            action.projectId,
            action.blockChainId,
            action.networkId,
            action.blockHash,
            action.blockHeight,
            action.blockTime,
            action.minConfirmations,
            action.confirmations,
            action.txHash,
            action.address,
            action.type,
            action.refId,
            action.eventId,
            action.params
        );

        await this.webhookService.setStatus(created.id, Scheme.WebhookReportItemStatus.Created);

        return;
    }
}
