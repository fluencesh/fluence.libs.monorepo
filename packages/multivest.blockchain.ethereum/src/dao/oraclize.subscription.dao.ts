import { Dao } from '@applicature/multivest.core';
import { OraclizeStatus, OraclizeSubscription } from '../types';

export abstract class OraclizeSubscriptionDao extends Dao<OraclizeSubscription> {
    public abstract createOraclize(
        projectId: string,
        eventHash: string,
        eventName: string,
        eventInputTypes: Array<string>,
        webhookUrl: string
    ): Promise<OraclizeSubscription>;

    public abstract getById(oraclizeId: string): Promise<OraclizeSubscription>;
    public abstract getByIdAndProjectId(oraclizeId: string, projectId: string): Promise<OraclizeSubscription>;

    public abstract listByEventHash(eventHash: string): Promise<Array<OraclizeSubscription>>;
    public abstract listByEventHashAndStatus(
        eventHash: string,
        status: OraclizeStatus
    ): Promise<Array<OraclizeSubscription>>;
    public abstract listByEventHashes(eventHashes: Array<string>): Promise<Array<OraclizeSubscription>>;
    public abstract listByEventHashesAndStatus(
        eventHashes: Array<string>,
        status: OraclizeStatus
    ): Promise<Array<OraclizeSubscription>>;
    public abstract listByProjectId(projectId: string): Promise<Array<OraclizeSubscription>>;
    public abstract listByStatus(status: OraclizeStatus): Promise<Array<OraclizeSubscription>>;
    public abstract listByStatusAndProjectId(
        status: OraclizeStatus,
        projectId: string
    ): Promise<Array<OraclizeSubscription>>;

    public abstract setStatus(oraclizeId: string, status: OraclizeStatus): Promise<void>;
}
