import { Dao } from '@applicature-private/multivest.core';
import { Scheme } from '../types';
import { SubscriptionDao } from './subscription.dao';

export abstract class TransactionHashSubscriptionDao extends SubscriptionDao<Scheme.TransactionHashSubscription> {
    public abstract async createSubscription(
        clientId: string,
        projectId: string,
        blockchainId: string,
        networkId: string,
        hash: string,
        minConfirmations: number
    ): Promise<Scheme.TransactionHashSubscription>;

    public abstract async listBySubscribedHashes(hashes: Array<string>)
        : Promise<Array<Scheme.TransactionHashSubscription>>;
    public abstract async listBySubscribedHashesActiveOnly(hashes: Array<string>)
        : Promise<Array<Scheme.TransactionHashSubscription>>;
    public abstract async listBySubscribedHash(hash: string, clientId: string, projectId: string)
        : Promise<Array<Scheme.TransactionHashSubscription>>;
    public abstract async listBySubscribedHashActiveOnly(hash: string, clientId: string, projectId: string)
        : Promise<Array<Scheme.TransactionHashSubscription>>;
}
