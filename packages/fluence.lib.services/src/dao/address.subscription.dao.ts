import { Scheme } from '../types';
import { SubscriptionDao } from './subscription.dao';

export abstract class AddressSubscriptionDao extends SubscriptionDao<Scheme.AddressSubscription> {
    public abstract async createSubscription(
        clientId: string,
        projectId: string,
        transportConnectionId: string,
        address: string,
        minConfirmations: number
    ): Promise<Scheme.AddressSubscription>;

    public abstract async listBySubscribedAddresses(addresses: Array<string>)
        : Promise<Array<Scheme.AddressSubscription>>;
    public abstract async listBySubscribedAddressesActiveOnly(addresses: Array<string>)
        : Promise<Array<Scheme.AddressSubscription>>;

    public abstract async listBySubscribedAddress(
        address: string,
        clientId: string,
        projectId: string
    ): Promise<Array<Scheme.AddressSubscription>>;
    public abstract async listBySubscribedAddressActiveOnly(
        address: string,
        clientId: string,
        projectId: string
    ): Promise<Array<Scheme.AddressSubscription>>;
}
