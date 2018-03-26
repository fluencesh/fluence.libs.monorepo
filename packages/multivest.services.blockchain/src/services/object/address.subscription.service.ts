import {PluginManager, Service} from '@applicature/multivest.core';
import { AddressSubscriptionDao } from '../../dao/address.subscription.dao';
import { Scheme } from '../../types';

export class AddressSubscriptionService extends Service {
    protected subscriptionDao: AddressSubscriptionDao;

    constructor(pluginManager: PluginManager) {
        super(pluginManager);

        // @TODO: set subscriptionDao
    }

    public getServiceId(): string {
        return 'object.subscriptions';
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
        return this.subscriptionDao
            .createSubscription(
                clientId, projectId,
                blockChainId, networkId,
                address,
                minConfirmations,
                subscribed, isProjectActive, isClientActive
            );
    }

    public async getById(subscriptionId: string): Promise<Scheme.AddressSubscription> {
        return this.subscriptionDao.getById(subscriptionId);
    }

    public async listByProjectId(projectId: string): Promise<Array<Scheme.AddressSubscription>> {
        return this.subscriptionDao.listByProjectId(projectId);
    }

    public async listByClientId(clientId: string): Promise<Array<Scheme.AddressSubscription>> {
        return this.subscriptionDao.listByClientId(clientId);
    }

    public async setSubscribed(
        id: string,
        subscribed: boolean
    ): Promise<void> {
        return this.subscriptionDao.setSubscribed(id, subscribed);
    }

    public async setProjectActive(
        projectId: string,
        isActive: boolean
    ): Promise<void> {
        return this.subscriptionDao.setProjectActive(projectId, isActive);
    }

    public async setClientActive(
        clientId: string,
        isActive: boolean
    ): Promise<void> {
        return this.subscriptionDao.setClientActive(clientId, isActive);
    }

    public async listBySubscribedAddresses(addresses: Array<string>): Promise<Array<Scheme.AddressSubscription>> {
        return this.subscriptionDao.listBySubscribedAddresses(addresses);
    }
}
