import { Transaction } from '@applicature-private/multivest.core';
import { MongoDBDao } from '@applicature-private/multivest.mongodb';
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
        tx: Transaction,
        privateKey: string
    ): Promise<Scheme.ScheduledTx> {
        return this.create({
            projectId,
            cronExpression,
            tx,
            privateKey
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

        return;
    }

    public async setTransaction(id: string, tx: Transaction): Promise<void> {
        await this.update({ id }, { tx });

        return;
    }
}
