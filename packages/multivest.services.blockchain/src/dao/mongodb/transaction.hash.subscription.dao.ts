import { MongoDBDao } from '@applicature/multivest.mongodb';
import { Scheme } from '../../types';
import { TransactionHashSubscriptionDao } from '../transaction.hash.subscription.dao';

export class MongodbTransactionHashSubscriptionDao extends MongoDBDao<Scheme.TransactionHashSubscription>
        implements TransactionHashSubscriptionDao {
    public getDaoId() {
        return 'transaction.hash.subscriptions';
    }

    public getCollectionName() {
        return 'transactionHashSubscriptions';
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
        subscribed: boolean,
        isProjectActive: boolean,
        isClientActive: boolean
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
            isClientActive
        });
    }

    public getById(id: string) {
        return this.get({ id });
    }

    public listByClientId(clientId: string): Promise<Array<Scheme.TransactionHashSubscription>> {
        return this.listRaw({ clientId });
    }

    public listByProjectId(projectId: string): Promise<Array<Scheme.TransactionHashSubscription>> {
        return this.listRaw({ projectId });
    }

    public listBySubscribedHashes(hashes: Array<string>): Promise<Array<Scheme.TransactionHashSubscription>> {
        return this.listRaw({
            hash: { $in: hashes }
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
}
