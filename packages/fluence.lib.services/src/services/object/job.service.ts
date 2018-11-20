import { Plugin } from '@applicature/synth.mongodb';
import { PluginManager, Service } from '@applicature/synth.plugin-manager';
import { DaoIds } from '../../constants';
import { JobDao } from '../../dao/job.dao';
import { Scheme } from '../../types';

export class JobService extends Service {
    protected jobDao: JobDao;

    constructor(pluginManager: PluginManager) {
        super(pluginManager);
    }

    public async init(): Promise<void> {
        const mongodbPlugin = this.pluginManager.get('mongodb') as any as Plugin;

        this.jobDao = await mongodbPlugin.getDao(DaoIds.Job) as JobDao;
    }

    public getServiceId(): string {
        return 'object.jobs';
    }

    public async getById(jobId: string): Promise<Scheme.Job> {
        return this.jobDao.getById(jobId);
    }

    public async createJob(jobId: string, params: any): Promise<Scheme.Job> {
        return this.jobDao.createJob(jobId, params);
    }

    public async setParams(id: string, params: any): Promise<void> {
        return this.jobDao.setParams(id, params);
    }
}
