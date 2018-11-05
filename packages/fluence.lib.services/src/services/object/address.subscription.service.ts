import { Plugin } from '@applicature-private/core.mongodb';
import { PluginManager, Service } from '@applicature-private/core.plugin-manager';
import { DaoIds } from '../../constants';
import { AddressSubscriptionDao } from '../../dao/address.subscription.dao';
import { Scheme } from '../../types';

export class AddressSubscriptionService extends Service {
    protected subscriptionDao: AddressSubscriptionDao;

    constructor(pluginManager: PluginManager) {
        super(pluginManager);
    }

    public async init(): Promise<void> {
        const mongodbPlugin = this.pluginManager.get('mongodb') as any as Plugin;

        this.subscriptionDao = await mongodbPlugin.getDao(DaoIds.AddressSubscription) as AddressSubscriptionDao;
    }

    public getServiceId(): string {
        return 'object.address.subscriptions';
    }

    public async createSubscription(
        clientId: string,
        projectId: string,
        transportConnectionId: string,
        address: string,
        minConfirmations: number
    ): Promise<Scheme.AddressSubscription> {
        return this.subscriptionDao
            .createSubscription(
                clientId,
                projectId,

                transportConnectionId,

                address,
                minConfirmations
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

    public async setSubscribedByProjectId(
        projectId: string,
        subscribed: boolean
    ): Promise<void> {
        return this.subscriptionDao.setSubscribedByProjectId(projectId, subscribed);
    }

    public async setSubscribedByClientId(
        clientId: string,
        subscribed: boolean
    ): Promise<void> {
        return this.subscriptionDao.setSubscribedByClientId(clientId, subscribed);
    }

    public async setClientActive(
        clientId: string,
        isActive: boolean
    ): Promise<void> {
        return this.subscriptionDao.setClientActive(clientId, isActive);
    }

    public async setProjectActive(
        projectId: string,
        isActive: boolean
    ): Promise<void> {
        return this.subscriptionDao.setProjectActive(projectId, isActive);
    }
}
