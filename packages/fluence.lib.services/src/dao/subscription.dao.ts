import { Dao } from '@applicature-private/core.plugin-manager';

export abstract class SubscriptionDao<T> extends Dao<T> {
    public abstract async createSubscription(
        ...params: Array<any>
    ): Promise<T>;

    public abstract async getById(subscriptionId: string): Promise<T>;
    public abstract async getByIdActiveOnly(subscriptionId: string): Promise<T>;

    public abstract async listByProjectId(projectId: string): Promise<Array<T>>;
    public abstract async listByProjectIdActiveOnly(projectId: string): Promise<Array<T>>;
    public abstract async listByClientId(clientId: string): Promise<Array<T>>;
    public abstract async listByClientIdActiveOnly(clientId: string): Promise<Array<T>>;

    public abstract async setSubscribed(
        id: string,
        subscribed: boolean
    ): Promise<void>;

    public abstract async setSubscribedByProjectId(
        projectId: string,
        subscribed: boolean
    ): Promise<void>;
    public abstract async setSubscribedByClientId(
        clientId: string,
        subscribed: boolean
    ): Promise<void>;

    public abstract async setClientActive(
        clientId: string,
        clientActive: boolean
    ): Promise<void>;
    public abstract async setProjectActive(
        clientId: string,
        clientActive: boolean
    ): Promise<void>;
}
