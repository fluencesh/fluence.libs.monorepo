import { Dao } from '@applicature/multivest.core';
import {
    EthereumContractAbiItem,
    EthereumContractCompatibleStandard,
    EthereumContractSubscription
} from '../types';

export abstract class EthereumContractSubscriptionDao extends Dao<EthereumContractSubscription> {
    public abstract async createContractSubscription(
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
    ): Promise<EthereumContractSubscription>;

    public abstract async getById(contractId: string): Promise<EthereumContractSubscription>;

    public abstract async listByProjectId(projectId: string): Promise<Array<EthereumContractSubscription>>;
    public abstract async listByClientId(clientId: string): Promise<Array<EthereumContractSubscription>>;
    public abstract async listBySubscribedAddresses(
        addresses: Array<string>
    ): Promise<Array<EthereumContractSubscription>>;
    public abstract async listBySubscribedAddress(
        address: string,
        clientId: string,
        projectId: string
    ): Promise<Array<EthereumContractSubscription>>;

    public abstract async setSubscribed(
        id: string,
        subscribed: boolean
    ): Promise<void>;

    public abstract async setProjectActive(
        projectId: string,
        isActive: boolean
    ): Promise<void>;

    public abstract async setClientActive(
        clientId: string,
        isActive: boolean
    ): Promise<void>;

    public abstract async setSubscribedEventsAndAllEvents(
        contractId: string,
        subscribedEvents: Array<string>,
        subscribeAllEvents: boolean
    ): Promise<void>;
}
