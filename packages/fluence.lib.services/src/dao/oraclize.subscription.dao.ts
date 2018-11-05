import { Scheme } from '../types';
import { SubscriptionDao } from './subscription.dao';

export abstract class OraclizeSubscriptionDao extends SubscriptionDao<Scheme.OraclizeSubscription> {
    public abstract createSubscription(
        clientId: string,
        projectId: string,
        transportConnectionId: string,
        minConfirmations: number,
        eventHash: string,
        eventName: string,
        eventInputTypes: Array<string>,
        webhookUrl: string
    ): Promise<Scheme.OraclizeSubscription>;

    public abstract getByIdAndProjectId(subscriptionId: string, projectId: string)
        : Promise<Scheme.OraclizeSubscription>;

    public abstract listByEventHash(eventHash: string): Promise<Array<Scheme.OraclizeSubscription>>;
    public abstract listByEventHashAndStatus(
        eventHash: string,
        subscribed: boolean
    ): Promise<Array<Scheme.OraclizeSubscription>>;
    public abstract listByEventHashes(eventHashes: Array<string>): Promise<Array<Scheme.OraclizeSubscription>>;
    public abstract listByEventHashesAndStatus(
        eventHashes: Array<string>,
        subscribed: boolean
    ): Promise<Array<Scheme.OraclizeSubscription>>;
    public abstract listByStatus(subscribed: boolean): Promise<Array<Scheme.OraclizeSubscription>>;
    public abstract listByStatusAndProjectId(
        subscribed: boolean,
        projectId: string
    ): Promise<Array<Scheme.OraclizeSubscription>>;
}
