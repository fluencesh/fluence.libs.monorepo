import { DaoCollectionNames, DaoIds } from '../../constants';
import { Scheme } from '../../types';
import { AddressSubscriptionDao } from '../address.subscription.dao';
import Subscription = Scheme.AddressSubscription;
import { MongodbSubscriptionDao } from './subscription.dao';

export class MongodbAddressSubscriptionDao extends MongodbSubscriptionDao<Scheme.AddressSubscription>
        implements AddressSubscriptionDao {

    public getDaoId() {
        return DaoIds.AddressSubscription;
    }

    public getCollectionName() {
        return DaoCollectionNames.AddressSubscription;
    }

    public getDefaultValue() {
        return {} as Scheme.AddressSubscription;
    }

    public async createSubscription(
        clientId: string,
        projectId: string,
        blockchainId: string,
        networkId: string,
        address: string,
        minConfirmations: number
    ): Promise<Scheme.AddressSubscription> {
        return this.create({
            clientId,
            projectId,
            blockchainId,
            networkId,

            address,
            minConfirmations,

            subscribed: true,
            isProjectActive: true,
            isClientActive: true,
            createdAt: new Date(),
        });
    }

    public async listBySubscribedAddresses(addresses: Array<string>): Promise<Array<Subscription>> {
        return this.listRaw({
            address: { $in: addresses },
        });
    }

    public async listBySubscribedAddressesActiveOnly(addresses: Array<string>): Promise<Array<Subscription>> {
        return this.listRaw({
            address: { $in: addresses },
            subscribed: true,
            isProjectActive: true,
            isClientActive: true,
        });
    }

    public async listBySubscribedAddress(
        address: string,
        clientId: string,
        projectId: string
    ): Promise<Array<Subscription>> {
        return this.listRaw({
            address,
            clientId,
            projectId
        });
    }

    public async listBySubscribedAddressActiveOnly(
        address: string,
        clientId: string,
        projectId: string
    ): Promise<Array<Subscription>> {
        return this.listRaw({
            address,
            clientId,
            projectId,
            subscribed: true,
            isProjectActive: true,
            isClientActive: true,
        });
    }
}
