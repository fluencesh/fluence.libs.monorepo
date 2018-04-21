import { MongoDBDao } from '@applicature/multivest.mongodb';
import { Scheme } from '../../types';
import { AddressSubscriptionDao } from '../address.subscription.dao';
import Subscription = Scheme.AddressSubscription;

export class MongodbAddressSubscriptionDao extends MongoDBDao<Scheme.AddressSubscription>
        implements AddressSubscriptionDao {

    public getDaoId() {
        return 'address.subscriptions';
    }

    public getCollectionName() {
        return 'addressSubscriptions';
    }

    public getDefaultValue() {
        return {} as Scheme.AddressSubscription;
    }

    public async createSubscription(
        clientId: string,
        projectId: string,
        blockChainId: string,
        networkId: string,
        address: string,
        minConfirmations: number,
        subscribed: boolean,
        isProjectActive: boolean,
        isClientActive: boolean
    ): Promise<Scheme.AddressSubscription> {
        return this.create({
            clientId,
            projectId,
            blockChainId,
            networkId,

            address,
            minConfirmations,

            subscribed,

            isProjectActive,
            isClientActive,

            createdAt: new Date()
        });
    }

    public async getById(id: string): Promise<Scheme.AddressSubscription> {
        return this.getRaw({
            id
        });
    }

    public async listByProjectId(projectId: string): Promise<Array<Scheme.AddressSubscription>> {
        return this.listRaw({
            projectId
        });
    }

    public async listByClientId(clientId: string): Promise<Array<Scheme.AddressSubscription>> {
        return this.listRaw({
            clientId
        });
    }

    public async setSubscribed(
        id: string,
        subscribed: boolean
    ): Promise<void> {
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

    public async listBySubscribedAddresses(addresses: Array<string>): Promise<Array<Subscription>> {
        return this.listRaw({
            address: { $in: addresses },
            subscribed: true,
            isProjectActive: true,
            isClientActive: true
        });
    }
}
