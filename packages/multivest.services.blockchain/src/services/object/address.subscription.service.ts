import { PluginManager, Service } from '@applicature/multivest.core';
import { Plugin } from '@applicature/multivest.mongodb';
import { AddressSubscriptionDao } from '../../dao/address.subscription.dao';
import { Scheme } from '../../types';

export class AddressSubscriptionService extends Service {
    protected subscriptionDao: AddressSubscriptionDao;

    constructor(pluginManager: PluginManager) {
        super(pluginManager);
    }

    public async init(): Promise<void> {
        const mongodbPlugin = this.pluginManager.get('mongodb') as Plugin;

        this.subscriptionDao = await mongodbPlugin.getDao('address.subscriptions') as AddressSubscriptionDao;
    }

    public getServiceId(): string {
        return 'object.address.subscriptions';
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

    public async getByIdActiveOnly(subscriptionId: string): Promise<Scheme.AddressSubscription> {
        return this.subscriptionDao.getByIdActiveOnly(subscriptionId);
    }

    public async listByProjectId(projectId: string): Promise<Array<Scheme.AddressSubscription>> {
        return this.subscriptionDao.listByProjectId(projectId);
    }

    public async listByProjectIdActiveOnly(projectId: string): Promise<Array<Scheme.AddressSubscription>> {
        return this.subscriptionDao.listByProjectIdActiveOnly(projectId);
    }

    public async listByClientId(clientId: string): Promise<Array<Scheme.AddressSubscription>> {
        return this.subscriptionDao.listByClientId(clientId);
    }

    public async listByClientIdActiveOnly(clientId: string): Promise<Array<Scheme.AddressSubscription>> {
        return this.subscriptionDao.listByClientIdActiveOnly(clientId);
    }

    public async listBySubscribedAddress(
        address: string,
        clientId: string,
        projectId: string
    ): Promise<Array<Scheme.AddressSubscription>> {
        return this.subscriptionDao.listBySubscribedAddress(address, clientId, projectId);
    }

    public async listBySubscribedAddressActiveOnly(
        address: string,
        clientId: string,
        projectId: string
    ): Promise<Array<Scheme.AddressSubscription>> {
        return this.subscriptionDao.listBySubscribedAddressActiveOnly(address, clientId, projectId);
    }

    public async listBySubscribedAddresses(addresses: Array<string>): Promise<Array<Scheme.AddressSubscription>> {
        return this.subscriptionDao.listBySubscribedAddresses(addresses);
    }

    public async listBySubscribedAddressesActiveOnly(
        addresses: Array<string>
    ): Promise<Array<Scheme.AddressSubscription>> {
        return this.subscriptionDao.listBySubscribedAddressesActiveOnly(addresses);
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
}
