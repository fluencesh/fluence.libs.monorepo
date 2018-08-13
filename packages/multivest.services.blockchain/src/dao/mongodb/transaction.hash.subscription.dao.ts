import { MongoDBDao } from '@applicature-private/multivest.mongodb';
import { DaoCollectionNames, DaoIds } from '../../constants';
import { Scheme } from '../../types';
import { TransactionHashSubscriptionDao } from '../transaction.hash.subscription.dao';

export class MongodbTransactionHashSubscriptionDao extends MongoDBDao<Scheme.TransactionHashSubscription>
        implements TransactionHashSubscriptionDao {
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
        blockChainId: string,
        networkId: string,
        hash: string,
        minConfirmations: number,
        subscribed: boolean = true,
        isProjectActive: boolean = true,
        isClientActive: boolean = true
    ): Promise<Scheme.TransactionHashSubscription> {
        return this.create({
            clientId,
            projectId,
            blockChainId,
            networkId,

            hash,
            minConfirmations,

            subscribed,

            isProjectActive,
            isClientActive,

            createdAt: new Date()
        });
    }

    public getById(id: string) {
        return this.get({ id });
    }

    public getByIdActiveOnly(id: string) {
        return this.get({
            id,
            subscribed: true,
            isClientActive: true,
            isProjectActive: true
        });
    }

    public listByClientId(clientId: string): Promise<Array<Scheme.TransactionHashSubscription>> {
        return this.listRaw({ clientId });
    }

    public listByClientIdActiveOnly(clientId: string): Promise<Array<Scheme.TransactionHashSubscription>> {
        return this.listRaw({
            clientId,
            subscribed: true,
            isClientActive: true,
            isProjectActive: true
        });
    }

    public listByProjectId(projectId: string): Promise<Array<Scheme.TransactionHashSubscription>> {
        return this.listRaw({ projectId });
    }

    public listByProjectIdActiveOnly(projectId: string): Promise<Array<Scheme.TransactionHashSubscription>> {
        return this.listRaw({
            projectId,
            subscribed: true,
            isClientActive: true,
            isProjectActive: true
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
            isClientActive: true,
            isProjectActive: true
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
            isClientActive: true,
            isProjectActive: true
        });
    }

    public async setSubscribed(id: string, subscribed: boolean) {
        await this.updateRaw({ id }, {
            $set: {
                subscribed
            }
        });

        return;
    }

    public async setProjectActive(
        projectId: string,
        isActive: boolean
    ): Promise<void> {
        await this.updateRaw({ projectId }, {
            $set: {
                isProjectActive: isActive
            }
        });

        return;
    }

    public async setClientActive(
        clientId: string,
        isActive: boolean
    ): Promise<void> {
        await this.updateRaw({ clientId }, {
            $set: {
                isClientActive: isActive
            }
        });

        return;
    }
}
