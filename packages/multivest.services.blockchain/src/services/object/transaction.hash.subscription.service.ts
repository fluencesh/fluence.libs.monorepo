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
}
