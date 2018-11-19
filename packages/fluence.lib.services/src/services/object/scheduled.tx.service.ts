import { Plugin as MongoPlugin } from '@applicature/synth.mongodb';
import { MultivestError, Service } from '@applicature/synth.plugin-manager';
import { CronExpressionValidation, DaoIds, ScheduledTxJobName } from '../../constants';
import { ClientDao, ProjectDao } from '../../dao';
import { ScheduledTxDao } from '../../dao/scheduled.tx.dao';
import { Errors } from '../../errors';
import { Scheme } from '../../types';

export class ScheduledTxService extends Service {
    private scheduledTxDao: ScheduledTxDao;
    private projectDao: ProjectDao;
    private clientDao: ClientDao;

    public getServiceId() {
        return 'scheduled.tx.service';
    }

    public async init() {
        await super.init();

        const mongoPlugin = this.pluginManager.get('mongodb') as any as MongoPlugin;

        this.scheduledTxDao = await mongoPlugin.getDao(DaoIds.ScheduledTx) as ScheduledTxDao;
        this.projectDao = await mongoPlugin.getDao(DaoIds.Project) as ProjectDao;
        this.clientDao = await mongoPlugin.getDao(DaoIds.Client) as ClientDao;
    }

    public async createScheduledTx(
        projectId: string,
        cronExpression: string,

        tx: Scheme.BlockchainTransaction,
        privateKey: string,

        transportConnectionId: string
    ): Promise<Scheme.ScheduledTx> {
        try {
            const project = await this.projectDao.getById(projectId);
            if (!project) {
                throw new MultivestError(Errors.PROJECT_NOT_FOUND);
            }

            const client = await this.clientDao.getById(project.clientId);
            if (!client) {
                throw new MultivestError(Errors.CLIENT_NOT_FOUND);
            }

            const scheduledTx = await this.scheduledTxDao.createScheduledTx(
                projectId,
                cronExpression,
                tx,
                privateKey,
                transportConnectionId
            );

            const agenda = this.pluginManager.getJobExecutor();
            try {
                const jobData: Scheme.ScheduledTxJobData = {
                    scheduledTxId: scheduledTx.id,
                    cronExpression,
                };

                const job = agenda.create(ScheduledTxJobName, jobData) as any;
                await job.save();

                scheduledTx.relatedJobId = job.attrs._id.toHexString();
            } catch (ex) {
                throw new MultivestError(Errors.CANT_CREATE_AGENDA_JOB);
            }

            return scheduledTx;
        } catch (ex) {
            if (ex instanceof MultivestError) {
                throw ex;
            } else {
                throw new MultivestError(Errors.DB_EXECUTION_ERROR);
            }
        }

    }

    public async getById(id: string): Promise<Scheme.ScheduledTx> {
        return this.scheduledTxDao.getById(id);
    }

    public async getByIdAndProjectId(id: string, projectId: string): Promise<Scheme.ScheduledTx> {
        return this.scheduledTxDao.getByIdAndProjectId(id, projectId);
    }

    public async listByProjectId(projectId: string): Promise<Array<Scheme.ScheduledTx>> {
        return this.scheduledTxDao.listByProjectId(projectId);
    }

    public async setCronExpression(id: string, cronExpression: string) {
        const isValid = CronExpressionValidation.test(cronExpression);

        if (isValid) {
            await this.scheduledTxDao.setCronExpression(id, cronExpression);
        } else {
            throw new MultivestError(Errors.INVALID_CRON_EXPRESSION);
        }
    }

    public async setTransaction(id: string, tx: Scheme.BlockchainTransaction): Promise<void> {
        await this.scheduledTxDao.setTransaction(id, tx);
    }
}
