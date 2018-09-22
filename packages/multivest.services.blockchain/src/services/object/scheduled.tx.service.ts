import { MultivestError, PluginManager, Service, Transaction } from '@fluencesh/multivest.core';
import { CronExpressionValidation, DaoIds } from '../../constants';
import { ScheduledTxDao } from '../../dao/scheduled.tx.dao';
import { Errors } from '../../errors';
import { Scheme } from '../../types';
import { BlockchainService } from '../blockchain/blockchain.service';
import { ScheduledTxJobManager } from '../cronjob/scheduled.tx.job.manager';

export class ScheduledTxService extends Service {
    private dao: ScheduledTxDao;
    private scheduledTxJobManager: ScheduledTxJobManager;

    constructor(pluginManager: PluginManager, blockchainService: BlockchainService) {
        super(pluginManager);

        this.dao = this.pluginManager.getDao(DaoIds.ScheduledTx) as ScheduledTxDao;
        this.scheduledTxJobManager = new ScheduledTxJobManager(pluginManager, blockchainService);
    }

    public getServiceId() {
        return 'scheduled.tx.service';
    }

    public async init() {
        await super.init();

        const scheduledTxs = await this.dao.list({});
        await Promise.all(scheduledTxs.map((scheduledTx) => this.scheduledTxJobManager.createJob(scheduledTx)));
    }

    public async createScheduledTx(
        projectId: string,
        cronExpression: string,
        tx: Transaction,
        privateKey: string
    ): Promise<Scheme.ScheduledTx> {
        const scheduledTx = await this.dao.createScheduledTx(projectId, cronExpression, tx, privateKey);
        await this.scheduledTxJobManager.createJob(scheduledTx);

        return scheduledTx;
    }

    public async getById(id: string): Promise<Scheme.ScheduledTx> {
        return this.dao.getById(id);
    }

    public async getByIdAndProjectId(id: string, projectId: string): Promise<Scheme.ScheduledTx> {
        return this.dao.getByIdAndProjectId(id, projectId);
    }

    public async listByProjectId(projectId: string): Promise<Array<Scheme.ScheduledTx>> {
        return this.dao.listByProjectId(projectId);
    }

    public async setCronExpression(id: string, cronExpression: string) {
        const isValid = CronExpressionValidation.test(cronExpression);

        if (isValid) {
            await this.dao.setCronExpression(id, cronExpression);

            const job = this.scheduledTxJobManager.getJobByScheduledTxId(id);
            await this.scheduledTxJobManager.changeCronExpression(job.getJobId(), cronExpression);

            return;
        } else {
            throw new MultivestError(Errors.INVALID_CRON_EXPRESSION);
        }
    }

    public async setTransaction(id: string, tx: Transaction): Promise<void> {
        await this.dao.setTransaction(id, tx);

        const job = this.scheduledTxJobManager.getJobByScheduledTxId(id);
        await this.scheduledTxJobManager.changeTransaction(job.getJobId(), tx);

        return;
    }
}
