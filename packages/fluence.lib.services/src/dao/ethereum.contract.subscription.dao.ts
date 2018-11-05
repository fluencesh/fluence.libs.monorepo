import { Scheme } from '../types';
import { SubscriptionDao } from './subscription.dao';

export abstract class EthereumContractSubscriptionDao extends SubscriptionDao<Scheme.EthereumContractSubscription> {
    public abstract async createSubscription(
        clientId: string,
        projectId: string,

        compatibleStandard: Scheme.EthereumContractCompatibleStandard,

        transportConnectionId: string,

        address: string,
        minConfirmations: number,

        abi: Array<Scheme.EthereumContractAbiItem>,

        abiEvents: Array<string>,

        subscribedEvents: Array<string>,
        subscribeAllEvents: boolean
    ): Promise<Scheme.EthereumContractSubscription>;

    public abstract async listBySubscribedAddresses(
        addresses: Array<string>
    ): Promise<Array<Scheme.EthereumContractSubscription>>;
    public abstract async listBySubscribedAddressesActiveOnly(
        addresses: Array<string>
    ): Promise<Array<Scheme.EthereumContractSubscription>>;
    public abstract async listBySubscribedAddress(
        address: string,
        clientId: string,
        projectId: string
    ): Promise<Array<Scheme.EthereumContractSubscription>>;
    public abstract async listBySubscribedAddressActiveOnly(
        address: string,
        clientId: string,
        projectId: string
    ): Promise<Array<Scheme.EthereumContractSubscription>>;

    public abstract async setSubscribedEventsAndAllEvents(
        contractId: string,
        subscribedEvents: Array<string>,
        subscribeAllEvents: boolean
    ): Promise<void>;
}
