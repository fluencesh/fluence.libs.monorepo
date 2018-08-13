import { PluginManager, Service, Transaction } from '@fluencesh/multivest.core';
import { Scheme } from '../../types';
import { BlockchainService } from '../blockchain/blockchain.service';
import { ScheduledTxJob } from './scheduled.tx.job';

export class ScheduledTxJobManager extends Service {
    private blockchainService: BlockchainService;
    private jobs: Array<ScheduledTxJob>;

    constructor(pluginManager: PluginManager, blockchainService: BlockchainService) {
        super(pluginManager);

        this.blockchainService = blockchainService;
        this.jobs = [];
    }

    public getServiceId() {
        return 'scheduled.tx.job.manager';
    }

    public async addJob(job: ScheduledTxJob) {
        this.jobs.push(job);

        if (!job.inited) {
            await job.init();
        }
    }

    public async createJob(scheduledTx: Scheme.ScheduledTx) {
        const job = new ScheduledTxJob(this.pluginManager, this.blockchainService, scheduledTx);
        await this.addJob(job);

        return job;
    }
    
    public async stopJob(jobId: string) {
        const job = this.getJobById(jobId);
        await job.stop();

        this.jobs.splice(this.jobs.indexOf(job), 1);

        return job;
    }

    public getJobById(jobId: string) {
        return this.jobs.find((j) => j.getJobId() === jobId);
    }

    public getJobByScheduledTxId(scheduledTxId: string) {
        return this.jobs.find((j) => j.getScheduledTxId() === scheduledTxId);
    }

    public async changeCronExpression(jobId: string, cronExpression: string) {
        const job = this.getJobById(jobId);
        await job.changeCronExpression(cronExpression);

        return;
    }

    public async changeTransaction(jobId: string, tx: Transaction) {
        const job = this.getJobById(jobId);

        job.changeTransaction(tx);
    }
}
