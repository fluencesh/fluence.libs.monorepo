import { PluginManager, Service } from '@applicature/multivest.core';
import { Plugin } from '@applicature/multivest.mongodb';
import { EthereumContractSubscriptionDao } from '../../dao/ethereum.contract.subscription.dao';
import {
    EthereumContractAbiItem,
    EthereumContractCompatibleStandard,
    EthereumContractSubscription,
} from '../types/types';

export class EthereumContractSubscriptionService extends Service {
    protected ethereumContractSubscriptionDao: EthereumContractSubscriptionDao;

    constructor(pluginManager: PluginManager) {
        super(pluginManager);
    }

    public async init(): Promise<void> {
        const mongodbPlugin = this.pluginManager.get('mongodb') as Plugin;

        this.ethereumContractSubscriptionDao = await
            mongodbPlugin.getDao('ethereumContracts') as EthereumContractSubscriptionDao;
    }

    public getServiceId(): string {
        return 'object.ethereumContracts';
    }

    public async createSubscription(
        clientId: string,
        projectId: string,

        compatibleStandard: EthereumContractCompatibleStandard,

        blockChainId: string,
        networkId: string,

        address: string,
        minConfirmations: number,

        abi: Array<EthereumContractAbiItem>,

        abiEvents: Array<string>,

        subscribedEvents: Array<string>,
        subscribeAllEvents: boolean,

        subscribed: boolean,
        isProjectActive: boolean,
        isClientActive: boolean
    ): Promise<EthereumContractSubscription> {
        return this.ethereumContractSubscriptionDao
            .createContractSubscription(
                clientId, projectId,
                compatibleStandard,
                blockChainId, networkId, address, minConfirmations,
                abi, abiEvents, subscribedEvents, subscribeAllEvents, subscribed, isProjectActive, isClientActive
            );
    }

    public async getById(subscriptionId: string): Promise<EthereumContractSubscription> {
        return this.ethereumContractSubscriptionDao.getById(subscriptionId);
    }

    public async listByProjectId(projectId: string): Promise<Array<EthereumContractSubscription>> {
        return this.ethereumContractSubscriptionDao.listByProjectId(projectId);
    }

    public async listByClientId(clientId: string): Promise<Array<EthereumContractSubscription>> {
        return this.ethereumContractSubscriptionDao.listByClientId(clientId);
    }

    public async listBySubscribedAddresses(
        addresses: Array<string>
    ): Promise<Array<EthereumContractSubscription>> {
        return this.ethereumContractSubscriptionDao.listBySubscribedAddresses(addresses);
    }

    public async setSubscribed(
        id: string,
        subscribed: boolean
    ): Promise<void> {
        return this.ethereumContractSubscriptionDao.setSubscribed(id, subscribed);
    }

    public async setProjectActive(
        projectId: string,
        isActive: boolean
    ): Promise<void> {
        return this.ethereumContractSubscriptionDao.setProjectActive(projectId, isActive);
    }

    public async setClientActive(
        clientId: string,
        isActive: boolean
    ): Promise<void> {
        return this.ethereumContractSubscriptionDao.setClientActive(clientId, isActive);
    }

    public async setSubscribedEventsAndAllEvents(
        contractId: string,
        subscribedEvents: Array<string>,
        subscribeAllEvents: boolean
    ): Promise<void> {
        return this.ethereumContractSubscriptionDao.setSubscribedEventsAndAllEvents(
            contractId, subscribedEvents, subscribeAllEvents
        );
    }
}
