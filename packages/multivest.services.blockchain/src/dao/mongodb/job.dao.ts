import { Hashtable } from '@applicature/multivest.core';
import { MongoDBDao } from '@applicature/multivest.mongodb';
import { Scheme } from '../../types';
import {JobDao} from '../job.dao';

export class MongodbJobDao extends MongoDBDao<Scheme.Job> implements JobDao {

    public getDaoId() {
        return 'jobs';
    }

    public getCollectionName() {
        return 'jobs';
    }

    public getDefaultValue() {
        return {} as Scheme.Job;
    }

    public getById(id: string) {
        return this.get({ id });
    }

    public createJob(id: string, params: Hashtable<any>): Promise<Scheme.Job> {
        return this.create({
            id,
            params
        });
    }

    public async setParams(id: string, params: Hashtable<any>): Promise<void> {
        await this.updateRaw(
            {
                id
            },
            {
                $set: {
                    params
                }
            }
        );

        return;
    }
}
