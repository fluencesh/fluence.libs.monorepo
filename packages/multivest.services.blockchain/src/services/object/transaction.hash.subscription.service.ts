import { PluginManager, Service } from '@applicature/multivest.core';
import { Plugin } from '@applicature/multivest.mongodb';
import { TransactionHashSubscriptionDao } from '../../dao/transaction.hash.subscription.dao';
import { Scheme } from '../../types';

export class TransactionHashSubscriptionService extends Service {
    private transactionHashSubscriptionDao: TransactionHashSubscriptionDao;

    constructor(pluginManager: PluginManager) {
        super(pluginManager);
    }

    public async init(): Promise<void> {
        const mongodbPlugin = this.pluginManager.get('mongodb') as Plugin;

        this.transactionHashSubscriptionDao =
            await mongodbPlugin.getDao('transaction.hash.subscriptions') as TransactionHashSubscriptionDao;
    }

    public getServiceId() {
        return 'transaction.hash.subscription.service';
    }

    public getById(subscriptionId: string): Promise<Scheme.TransactionHashSubscription> {
        return this.transactionHashSubscriptionDao.getById(subscriptionId);
    }

    public listByClient(clientId: string): Promise<Array<Scheme.TransactionHashSubscription>> {
        return this.transactionHashSubscriptionDao.listByClientId(clientId);
    }

    public listByProject(projectId: string): Promise<Array<Scheme.TransactionHashSubscription>> {
        return this.transactionHashSubscriptionDao.listByProjectId(projectId);
    }

    public listBySubscribedHashes(hashes: Array<string>): Promise<Array<Scheme.TransactionHashSubscription>> {
        return this.transactionHashSubscriptionDao.listBySubscribedHashes(hashes);
    }

    public async listBySubscribedHash(
        hash: string,
        clientId: string,
        projectId: string
    ): Promise<Array<Scheme.TransactionHashSubscription>> {
        return this.transactionHashSubscriptionDao.listBySubscribedHash(hash, clientId, projectId);
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
        return this.transactionHashSubscriptionDao.createSubscription(
            clientId,
            projectId,
            blockChainId,
            networkId,
            hash,
            minConfirmations,
            subscribed,
            isProjectActive,
            isClientActive
        );
    }

    public setSubscribed(
        subscriptionId: string,
        subscribed: boolean
    ): Promise<void> {
        return this.transactionHashSubscriptionDao.setSubscribed(subscriptionId, subscribed);
    }

    public async setProjectActive(
        projectId: string,
        isActive: boolean
    ): Promise<void> {
        return this.transactionHashSubscriptionDao.setProjectActive(projectId, isActive);
    }

    public async setClientActive(
        clientId: string,
        isActive: boolean
    ): Promise<void> {
        return this.transactionHashSubscriptionDao.setClientActive(clientId, isActive);
    }
}
