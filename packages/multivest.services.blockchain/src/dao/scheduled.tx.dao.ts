import { Dao, Transaction } from '@applicature/multivest.core';
import { Scheme } from '../types';

export abstract class ScheduledTxDao extends Dao<Scheme.ScheduledTx> {
    public abstract createScheduledTx(
        projectId: string,
        cronExpression: string,
        tx: Transaction,
        privateKey: string
    ): Promise<Scheme.ScheduledTx>;

    public abstract getById(id: string): Promise<Scheme.ScheduledTx>;
    public abstract getByIdAndProjectId(id: string, projectId: string): Promise<Scheme.ScheduledTx>;

    public abstract listByProjectId(projectId: string): Promise<Array<Scheme.ScheduledTx>>;

    public abstract setCronExpression(id: string, cronExpression: string): Promise<void>;
    public abstract setTransaction(id: string, tx: Transaction): Promise<void>;
}
