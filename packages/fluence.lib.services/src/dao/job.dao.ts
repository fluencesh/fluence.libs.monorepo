import { Dao, Hashtable } from '@applicature/core.plugin-manager';
import { Scheme } from '../types';

export abstract class JobDao extends Dao<Scheme.Job> {
    public abstract async getById(id: string): Promise<Scheme.Job>;

    public abstract async createJob(id: string, params: Hashtable<any>): Promise<Scheme.Job>;

    public abstract async setParams(id: string, params: Hashtable<any>): Promise<void>;
}
