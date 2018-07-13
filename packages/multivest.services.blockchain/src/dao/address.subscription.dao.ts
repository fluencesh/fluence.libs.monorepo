import { Dao } from '@applicature/multivest.core';
import { Scheme } from '../types';
import Subscription = Scheme.AddressSubscription;

export abstract class AddressSubscriptionDao extends Dao<Scheme.AddressSubscription> {
    public abstract async createSubscription(
        clientId: string,
        projectId: string,
        blockchainId: string,
        networkId: string,
        address: string,
        minConfirmations: number,
        subscribed?: boolean,
        isProjectActive?: boolean,
        isClientActive?: boolean
    ): Promise<Scheme.AddressSubscription>;

    public abstract async getById(subscriptionId: string): Promise<Scheme.AddressSubscription>;
    public abstract async getByIdActiveOnly(subscriptionId: string): Promise<Scheme.AddressSubscription>;

    public abstract async listByProjectId(projectId: string): Promise<Array<Scheme.AddressSubscription>>;
    public abstract async listByProjectIdActiveOnly(projectId: string): Promise<Array<Scheme.AddressSubscription>>;
    public abstract async listByClientId(clientId: string): Promise<Array<Scheme.AddressSubscription>>;
    public abstract async listByClientIdActiveOnly(clientId: string): Promise<Array<Scheme.AddressSubscription>>;
    public abstract async listBySubscribedAddresses(addresses: Array<string>)
        : Promise<Array<Scheme.AddressSubscription>>;
    public abstract async listBySubscribedAddressesActiveOnly(addresses: Array<string>)
        : Promise<Array<Scheme.AddressSubscription>>;
    public abstract async listBySubscribedAddress(address: string, clientId: string, projectId: string)
        : Promise<Array<Scheme.AddressSubscription>>;
    public abstract async listBySubscribedAddressActiveOnly(address: string, clientId: string, projectId: string)
        : Promise<Array<Scheme.AddressSubscription>>;

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
}
