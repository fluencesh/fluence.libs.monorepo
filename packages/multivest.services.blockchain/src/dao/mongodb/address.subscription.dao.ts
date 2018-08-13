import { MongoDBDao } from '@fluencesh/multivest.mongodb';
import { DaoCollectionNames, DaoIds } from '../../constants';
import { Scheme } from '../../types';
import { AddressSubscriptionDao } from '../address.subscription.dao';
import Subscription = Scheme.AddressSubscription;

export class MongodbAddressSubscriptionDao extends MongoDBDao<Scheme.AddressSubscription>
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
        blockChainId: string,
        networkId: string,
        address: string,
        minConfirmations: number,
        subscribed: boolean = true,
        isProjectActive: boolean = true,
        isClientActive: boolean = true
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

    public async getByIdActiveOnly(id: string): Promise<Scheme.AddressSubscription> {
        return this.getRaw({
            id,
            subscribed: true,
            isClientActive: true,
            isProjectActive: true
        });
    }

    public async listByProjectId(projectId: string): Promise<Array<Scheme.AddressSubscription>> {
        return this.listRaw({
            projectId
        });
    }

    public async listByProjectIdActiveOnly(projectId: string): Promise<Array<Scheme.AddressSubscription>> {
        return this.listRaw({
            projectId,
            subscribed: true,
            isClientActive: true,
            isProjectActive: true
        });
    }

    public async listByClientId(clientId: string): Promise<Array<Scheme.AddressSubscription>> {
        return this.listRaw({
            clientId
        });
    }

    public async listByClientIdActiveOnly(clientId: string): Promise<Array<Scheme.AddressSubscription>> {
        return this.listRaw({
            clientId,
            subscribed: true,
            isClientActive: true,
            isProjectActive: true
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
            isClientActive: true,
            isProjectActive: true
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
            isClientActive: true,
            isProjectActive: true
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
}
