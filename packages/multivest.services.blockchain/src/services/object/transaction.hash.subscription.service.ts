import { PluginManager, Service } from '@fluencesh/multivest.core';
import { Plugin } from '@fluencesh/multivest.mongodb';
import { DaoIds } from '../../constants';
import { TransactionHashSubscriptionDao } from '../../dao/transaction.hash.subscription.dao';
import { Scheme } from '../../types';

export class TransactionHashSubscriptionService extends Service {
    private transactionHashSubscriptionDao: TransactionHashSubscriptionDao;

    constructor(pluginManager: PluginManager) {
        super(pluginManager);
    }

    public async init(): Promise<void> {
        const mongodbPlugin = this.pluginManager.get('mongodb') as any as Plugin;

        this.transactionHashSubscriptionDao =
            await mongodbPlugin.getDao(DaoIds.TransactionHashSubscription) as TransactionHashSubscriptionDao;
    }

    public getServiceId() {
        return 'transaction.hash.subscription.service';
    }

    public getById(subscriptionId: string): Promise<Scheme.TransactionHashSubscription> {
        return this.transactionHashSubscriptionDao.getById(subscriptionId);
    }

    public getByIdActiveOnly(subscriptionId: string): Promise<Scheme.TransactionHashSubscription> {
        return this.transactionHashSubscriptionDao.getByIdActiveOnly(subscriptionId);
    }

    public listByClient(clientId: string): Promise<Array<Scheme.TransactionHashSubscription>> {
        return this.transactionHashSubscriptionDao.listByClientId(clientId);
    }

    public listByClientActiveOnly(clientId: string): Promise<Array<Scheme.TransactionHashSubscription>> {
        return this.transactionHashSubscriptionDao.listByClientIdActiveOnly(clientId);
    }

    public listByProject(projectId: string): Promise<Array<Scheme.TransactionHashSubscription>> {
        return this.transactionHashSubscriptionDao.listByProjectId(projectId);
    }

    public listByProjectActiveOnly(projectId: string): Promise<Array<Scheme.TransactionHashSubscription>> {
        return this.transactionHashSubscriptionDao.listByProjectIdActiveOnly(projectId);
    }

    public listBySubscribedHashes(hashes: Array<string>): Promise<Array<Scheme.TransactionHashSubscription>> {
        return this.transactionHashSubscriptionDao.listBySubscribedHashes(hashes);
    }

    public listBySubscribedHashesActiveOnly(hashes: Array<string>): Promise<Array<Scheme.TransactionHashSubscription>> {
        return this.transactionHashSubscriptionDao.listBySubscribedHashesActiveOnly(hashes);
    }

    public async listBySubscribedHash(
        hash: string,
        clientId: string,
        projectId: string
    ): Promise<Array<Scheme.TransactionHashSubscription>> {
        return this.transactionHashSubscriptionDao.listBySubscribedHash(hash, clientId, projectId);
    }

    public async listBySubscribedHashActiveOnly(
        hash: string,
        clientId: string,
        projectId: string
    ): Promise<Array<Scheme.TransactionHashSubscription>> {
        return this.transactionHashSubscriptionDao.listBySubscribedHashActiveOnly(hash, clientId, projectId);
    }

    public createSubscription(
        clientId: string,
        projectId: string,
        blockChainId: string,
        networkId: string,
        hash: string,
        minConfirmations: number
    ): Promise<Scheme.TransactionHashSubscription> {
        return this.transactionHashSubscriptionDao.createSubscription(
            clientId,
            projectId,
            blockChainId,
            networkId,
            hash,
            minConfirmations
        );
    }

    public setSubscribed(
        subscriptionId: string,
        subscribed: boolean
    ): Promise<void> {
        return this.transactionHashSubscriptionDao.setSubscribed(subscriptionId, subscribed);
    }

    public async setSubscribedByProjectId(
        projectId: string,
        subscribed: boolean
    ): Promise<void> {
        return this.transactionHashSubscriptionDao.setSubscribedByProjectId(projectId, subscribed);
    }

    public async setSubscribedByClientId(
        clientId: string,
        subscribed: boolean
    ): Promise<void> {
        return this.transactionHashSubscriptionDao.setSubscribedByClientId(clientId, subscribed);
    }

    public async setClientActive(
        clientId: string,
        isActive: boolean
    ): Promise<void> {
        return this.transactionHashSubscriptionDao.setClientActive(clientId, isActive);
    }

    public async setProjectActive(
        projectId: string,
        isActive: boolean
    ): Promise<void> {
        return this.transactionHashSubscriptionDao.setProjectActive(projectId, isActive);
    }
}
