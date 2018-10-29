import { DaoCollectionNames, DaoIds } from '../../constants';
import { Scheme } from '../../types';
import { OraclizeSubscriptionDao } from '../oraclize.subscription.dao';
import { MongodbSubscriptionDao } from './subscription.dao';

export class MongodbOraclizeSubscriptionDao
    extends MongodbSubscriptionDao<Scheme.OraclizeSubscription>
    implements OraclizeSubscriptionDao
{
    public getDaoId() {
        return DaoIds.Oraclize;
    }

    public getCollectionName() {
        return DaoCollectionNames.Oraclize;
    }

    public getDefaultValue() {
        return { } as Scheme.OraclizeSubscription;
    }

    public async createSubscription(
        clientId: string,
        projectId: string,
        blockchainId: string,
        networkId: string,
        minConfirmations: number,
        eventHash: string,
        eventName: string,
        eventInputTypes: Array<string>,
        webhookUrl: string
    ): Promise<Scheme.OraclizeSubscription> {
        return this.create({
            clientId,
            projectId,

            blockchainId,
            networkId,

            minConfirmations,

            eventHash,
            eventName,
            eventInputTypes,
            webhookUrl,

            subscribed: true,
            createdAt: new Date(),
        });
    }

    public async getByIdAndProjectId(subscriptionId: string, projectId: string): Promise<Scheme.OraclizeSubscription> {
        return this.getRaw({ id: subscriptionId, projectId });
    }

    public async listByEventHash(eventHash: string): Promise<Array<Scheme.OraclizeSubscription>> {
        return this.listRaw({ eventHash });
    }

    public async listByEventHashAndStatus(
        eventHash: string,
        subscribed: boolean
    ): Promise<Array<Scheme.OraclizeSubscription>> {
        return this.listRaw({ eventHash, subscribed });
    }

    public async listByEventHashes(eventHashes: Array<string>): Promise<Array<Scheme.OraclizeSubscription>> {
        return this.listRaw({
            eventHash: {
                $in: eventHashes
            }
        });
    }

    public async listByEventHashesAndStatus(
        eventHashes: Array<string>,
        subscribed: boolean
    ): Promise<Array<Scheme.OraclizeSubscription>> {
        return this.listRaw({
            eventHash: {
                $in: eventHashes
            },
            subscribed
        });
    }

    public async listByStatus(subscribed: boolean): Promise<Array<Scheme.OraclizeSubscription>> {
        return this.listRaw({ subscribed });
    }

    public async listByStatusAndProjectId(
        subscribed: boolean,
        projectId: string
    ): Promise<Array<Scheme.OraclizeSubscription>> {
        return this.listRaw({ subscribed, projectId });
    }
}
