import { MongoDBDao } from '@applicature/core.mongodb';
import { Hashtable } from '@applicature/core.plugin-manager';
import { DaoCollectionNames, DaoIds } from '../../constants';
import { Scheme } from '../../types';
import {JobDao} from '../job.dao';

export class MongodbJobDao extends MongoDBDao<Scheme.Job> implements JobDao {

    public getDaoId() {
        return DaoIds.Job;
    }

    public getCollectionName() {
        return DaoCollectionNames.Job;
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
    }
}
