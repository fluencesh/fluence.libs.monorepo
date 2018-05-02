import { Dao } from '@applicature/multivest.core';
import { Scheme } from '../types';

export abstract class TransactionHashSubscriptionDao extends Dao<Scheme.TransactionHashSubscription> {
    public abstract async createSubscription(
        clientId: string,
        projectId: string,
        blockChainId: string,
        networkId: string,
        hash: string,
        minConfirmations: number,
        subscribed?: boolean,
        isProjectActive?: boolean,
        isClientActive?: boolean
    ): Promise<Scheme.TransactionHashSubscription>;

    public abstract async getById(subscriptionId: string): Promise<Scheme.TransactionHashSubscription>;

    public abstract async listByProjectId(projectId: string): Promise<Array<Scheme.TransactionHashSubscription>>;
    public abstract async listByClientId(clientId: string): Promise<Array<Scheme.TransactionHashSubscription>>;
    public abstract async listBySubscribedHashes(hashes: Array<string>)
        : Promise<Array<Scheme.TransactionHashSubscription>>;
    public abstract async listBySubscribedHash(hash: string, clientId: string, projectId: string)
        : Promise<Array<Scheme.TransactionHashSubscription>>;

    public abstract async setSubscribed(
        subscriptionId: string,
        subscribed: boolean
    ): Promise<void>;

    public abstract async setProjectActive(
        projectId: string,
        isActive: boolean
    ): Promise<void>;

    public abstract async setClientActive(
        clientId: string,
        isActive: boolean
    ): Promise<void>;
}
