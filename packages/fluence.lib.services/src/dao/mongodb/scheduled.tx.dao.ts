import { MongoDBDao } from '@applicature/core.mongodb';
import { DaoCollectionNames, DaoIds } from '../../constants';
import { Scheme } from '../../types';
import { ScheduledTxDao } from '../scheduled.tx.dao';

export class MongodbScheduledTxDao extends MongoDBDao<Scheme.ScheduledTx> implements ScheduledTxDao {
    public getCollectionName() {
        return DaoCollectionNames.ScheduledTx;
    }

    public getDaoId() {
        return DaoIds.ScheduledTx;
    }

    public getDefaultValue() {
        return {} as Scheme.ScheduledTx;
    }

    public createScheduledTx(
        projectId: string,
        cronExpression: string,

        tx: Scheme.BlockchainTransaction,
        privateKey: string,

        transportConnectionId: string
    ): Promise<Scheme.ScheduledTx> {
        return this.create({
            projectId,
            cronExpression,

            tx,
            privateKey,

            transportConnectionId,
        });
    }

    public getById(id: string): Promise<Scheme.ScheduledTx> {
        return this.get({ id });
    }

    public getByIdAndProjectId(id: string, projectId: string): Promise<Scheme.ScheduledTx> {
        return this.get({ id, projectId });
    }

    public listByProjectId(projectId: string): Promise<Array<Scheme.ScheduledTx>> {
        return this.list({ projectId });
    }

    public async setCronExpression(id: string, cronExpression: string): Promise<void> {
        await this.update({ id }, { cronExpression });
    }

    public async setTransaction(id: string, tx: Scheme.BlockchainTransaction): Promise<void> {
        await this.update({ id }, { tx });
    }

    public async setRelatedJobId(id: string, relatedJobId: string): Promise<void> {
        await this.updateRaw({ id }, {
            $set: {
                relatedJobId
            }
        });
    }
}
