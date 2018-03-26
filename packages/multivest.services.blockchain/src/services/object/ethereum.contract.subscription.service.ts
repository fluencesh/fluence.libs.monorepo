import {PluginManager, Service} from '@applicature/multivest.core';
import { EthereumContractSubscriptionDao } from '../../dao/ethereum.contract.subscription.dao';
import { Scheme } from '../../types';

export class EthereumContractSubscriptionService extends Service {
    protected ethereumContractSubscriptionDao: EthereumContractSubscriptionDao;

    constructor(pluginManager: PluginManager) {
        super(pluginManager);

        // @TODO: set ethereumContractSubscriptionDao
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
        subscribeAllEvents: boolean,

        subscribed: boolean,
        isProjectActive: boolean,
        isClientActive: boolean
    ): Promise<Scheme.AddressSubscription> {
        return this.ethereumContractSubscriptionDao
            .createContractSubscription(
                clientId, projectId,
                compatibleStandard,
                blockChainId, networkId, address, minConfirmations,
                abi, abiEvents, subscribedEvents, subscribeAllEvents, subscribed, isProjectActive, isClientActive
            );
    }

    public async getById(subscriptionId: string): Promise<Scheme.AddressSubscription> {
        return this.ethereumContractSubscriptionDao.getById(subscriptionId);
    }

    public async listByProjectId(projectId: string): Promise<Array<Scheme.AddressSubscription>> {
        return this.ethereumContractSubscriptionDao.listByProjectId(projectId);
    }

    public async listByClientId(clientId: string): Promise<Array<Scheme.AddressSubscription>> {
        return this.ethereumContractSubscriptionDao.listByClientId(clientId);
    }

    public async listBySubscribedAddresses(
        addresses: Array<string>
    ): Promise<Array<Scheme.EthereumContractSubscription>> {
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
