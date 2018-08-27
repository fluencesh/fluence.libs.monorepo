import { MultivestError, PluginManager, Service } from '@fluencesh/multivest.core';
import { Plugin } from '@fluencesh/multivest.mongodb';
import { DaoIds } from '../../constants';
import { EthereumContractSubscriptionDao } from '../../dao/ethereum.contract.subscription.dao';
import { Errors } from '../../errors';
import { Scheme } from '../../types';

export class EthereumContractSubscriptionService extends Service {
    protected ethereumContractSubscriptionDao: EthereumContractSubscriptionDao;

    constructor(pluginManager: PluginManager) {
        super(pluginManager);
    }

    public async init(): Promise<void> {
        const mongodbPlugin = this.pluginManager.get('mongodb') as any as Plugin;

        this.ethereumContractSubscriptionDao = await
            mongodbPlugin.getDao(DaoIds.EthereumContractSubscription) as EthereumContractSubscriptionDao;
    }

    public getServiceId(): string {
        return 'object.ethereumContracts';
    }

    public async createSubscription(
        clientId: string,
        projectId: string,

        compatibleStandard: Scheme.EthereumContractCompatibleStandard,

        blockChainId: string,
        networkId: string,

        address: string,
        minConfirmations: number,

        abi: Array<Scheme.EthereumContractAbiItem>,

        abiEvents: Array<string>,

        subscribedEvents: Array<string>,
        subscribeAllEvents: boolean
    ): Promise<Scheme.EthereumContractSubscription> {
        const abiEventsList = abi
            .filter((method) => method.type === 'event')
            .map((method) => method.name);

        const subscribedEventsIsIncorrect = !!subscribedEvents.find((event) => !abiEventsList.includes(event));
        if (subscribedEventsIsIncorrect) {
            throw new MultivestError(Errors.SUBSCRIBED_EVENTS_ARE_INVALID, 400);
        }

        return this.ethereumContractSubscriptionDao
            .createSubscription(
                clientId,
                projectId,
                compatibleStandard,
                blockChainId,
                networkId,
                address,
                minConfirmations,
                abi,
                abiEvents,
                subscribedEvents,
                subscribeAllEvents
            );
    }

    public async getById(subscriptionId: string): Promise<Scheme.EthereumContractSubscription> {
        return this.ethereumContractSubscriptionDao.getById(subscriptionId);
    }

    public async getByIdActiveOnly(subscriptionId: string): Promise<Scheme.EthereumContractSubscription> {
        return this.ethereumContractSubscriptionDao.getByIdActiveOnly(subscriptionId);
    }

    public async listByProjectId(projectId: string): Promise<Array<Scheme.EthereumContractSubscription>> {
        return this.ethereumContractSubscriptionDao.listByProjectId(projectId);
    }

    public async listByProjectIdActiveOnly(projectId: string): Promise<Array<Scheme.EthereumContractSubscription>> {
        return this.ethereumContractSubscriptionDao.listByProjectIdActiveOnly(projectId);
    }

    public async listByClientId(clientId: string): Promise<Array<Scheme.EthereumContractSubscription>> {
        return this.ethereumContractSubscriptionDao.listByClientId(clientId);
    }

    public async listByClientIdActiveOnly(clientId: string): Promise<Array<Scheme.EthereumContractSubscription>> {
        return this.ethereumContractSubscriptionDao.listByClientIdActiveOnly(clientId);
    }

    public async listBySubscribedAddresses(
        addresses: Array<string>
    ): Promise<Array<Scheme.EthereumContractSubscription>> {
        return this.ethereumContractSubscriptionDao.listBySubscribedAddresses(addresses);
    }

    public async listBySubscribedAddressesActiveOnly(
        addresses: Array<string>
    ): Promise<Array<Scheme.EthereumContractSubscription>> {
        return this.ethereumContractSubscriptionDao.listBySubscribedAddressesActiveOnly(addresses);
    }

    public async listBySubscribedAddress(
        address: string,
        clientId: string,
        projectId: string
    ): Promise<Array<Scheme.EthereumContractSubscription>> {
        return this.ethereumContractSubscriptionDao.listBySubscribedAddress(address, clientId, projectId);
    }

    public async listBySubscribedAddressActiveOnly(
        address: string,
        clientId: string,
        projectId: string
    ): Promise<Array<Scheme.EthereumContractSubscription>> {
        return this.ethereumContractSubscriptionDao.listBySubscribedAddressActiveOnly(address, clientId, projectId);
    }

    public async setSubscribed(
        id: string,
        subscribed: boolean
    ): Promise<void> {
        return this.ethereumContractSubscriptionDao.setSubscribed(id, subscribed);
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

    public async setSubscribedByProjectId(
        projectId: string,
        subscribed: boolean
    ): Promise<void> {
        return this.ethereumContractSubscriptionDao.setSubscribedByProjectId(projectId, subscribed);
    }

    public async setSubscribedByClientId(
        clientId: string,
        subscribed: boolean
    ): Promise<void> {
        return this.ethereumContractSubscriptionDao.setSubscribedByClientId(clientId, subscribed);
    }

    public async setClientActive(
        clientId: string,
        isActive: boolean
    ): Promise<void> {
        return this.ethereumContractSubscriptionDao.setClientActive(clientId, isActive);
    }

    public async setProjectActive(
        projectId: string,
        isActive: boolean
    ): Promise<void> {
        return this.ethereumContractSubscriptionDao.setProjectActive(projectId, isActive);
    }
}
