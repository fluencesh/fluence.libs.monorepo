import { MongoDBDao } from '@applicature/core.mongodb';
import { DaoCollectionNames, DaoIds } from '../../constants';
import { Scheme } from '../../types';
import { TransactionHashSubscriptionDao } from '../transaction.hash.subscription.dao';
import { MongodbSubscriptionDao } from './subscription.dao';

export class MongodbTransactionHashSubscriptionDao
        extends MongodbSubscriptionDao<Scheme.TransactionHashSubscription>
        implements TransactionHashSubscriptionDao
{
    public getDaoId() {
        return DaoIds.TransactionHashSubscription;
    }

    public getCollectionName() {
        return DaoCollectionNames.TransactionHashSubscription;
    }

    public getDefaultValue() {
        return {} as Scheme.TransactionHashSubscription;
    }

    public createSubscription(
        clientId: string,
        projectId: string,
        blockchainId: string,
        networkId: string,
        hash: string,
        minConfirmations: number
    ): Promise<Scheme.TransactionHashSubscription> {
        return this.create({
            clientId,
            projectId,
            blockchainId,
            networkId,

            hash,
            minConfirmations,

            subscribed: true,
            createdAt: new Date()
        });
    }

    public getById(id: string) {
        return this.get({ id });
    }

    public getByIdActiveOnly(id: string) {
        return this.getRaw({
            id,
            subscribed: true,
        });
    }

    public listByClientId(clientId: string): Promise<Array<Scheme.TransactionHashSubscription>> {
        return this.listRaw({ clientId });
    }

    public listByClientIdActiveOnly(clientId: string): Promise<Array<Scheme.TransactionHashSubscription>> {
        return this.listRaw({
            clientId,
            subscribed: true,
        });
    }

    public listByProjectId(projectId: string): Promise<Array<Scheme.TransactionHashSubscription>> {
        return this.listRaw({ projectId });
    }

    public listByProjectIdActiveOnly(projectId: string): Promise<Array<Scheme.TransactionHashSubscription>> {
        return this.listRaw({
            projectId,
            subscribed: true,
        });
    }

    public listBySubscribedHashes(hashes: Array<string>): Promise<Array<Scheme.TransactionHashSubscription>> {
        return this.listRaw({
            hash: { $in: hashes }
        });
    }

    public listBySubscribedHashesActiveOnly(hashes: Array<string>): Promise<Array<Scheme.TransactionHashSubscription>> {
        return this.listRaw({
            hash: { $in: hashes },
            subscribed: true,
        });
    }

    public listBySubscribedHash(
        hash: string,
        clientId: string,
        projectId: string
    ): Promise<Array<Scheme.TransactionHashSubscription>> {
        return this.listRaw({
            hash,
            clientId,
            projectId
        });
    }

    public listBySubscribedHashActiveOnly(
        hash: string,
        clientId: string,
        projectId: string
    ): Promise<Array<Scheme.TransactionHashSubscription>> {
        return this.listRaw({
            hash,
            clientId,
            projectId,
            subscribed: true,
        });
    }

    public async setSubscribed(id: string, subscribed: boolean) {
        await this.updateRaw({ id }, {
            $set: {
                subscribed
            }
        });
    }

    public async setSubscribedByClientId(clientId: string, subscribed: boolean): Promise<void> {
        await this.updateRaw({ clientId }, {
            $set: {
                subscribed
            }
        });
    }

    public async setSubscribedByProjectId(projectId: string, subscribed: boolean): Promise<void> {
        await this.updateRaw({ projectId }, {
            $set: {
                subscribed
            }
        });
    }
}
