import { MongoDBDao } from '@applicature-private/core.mongodb';
import { Scheme } from '../../types';
import { SubscriptionDao } from '../subscription.dao';

export abstract class MongodbSubscriptionDao<T extends Scheme.Subscription>
    extends MongoDBDao<T>
    implements SubscriptionDao<T>
{
    public abstract async createSubscription(
        ...params: Array<any>
    ): Promise<T>;

    public async getById(id: string): Promise<T> {
        return this.getRaw({ id });
    }

    public async getByIdActiveOnly(id: string): Promise<T> {
        return this.getRaw({
            id,
            subscribed: true,
            isProjectActive: true,
            isClientActive: true,
        });
    }

    public async listByProjectId(projectId: string): Promise<Array<T>> {
        return this.listRaw({
            projectId
        });
    }

    public async listByProjectIdActiveOnly(projectId: string): Promise<Array<T>> {
        return this.listRaw({
            projectId,
            subscribed: true,
            isProjectActive: true,
            isClientActive: true,
        });
    }

    public async listByClientId(clientId: string): Promise<Array<T>> {
        return this.listRaw({
            clientId
        });
    }

    public async listByClientIdActiveOnly(clientId: string): Promise<Array<T>> {
        return this.listRaw({
            clientId,
            subscribed: true,
            isProjectActive: true,
            isClientActive: true,
        });
    }

    public async listBySubscribedAddresses(addresses: Array<string>): Promise<Array<T>> {
        return this.listRaw({
            address: { $in: addresses },
        });
    }

    public async listBySubscribedAddressesActiveOnly(addresses: Array<string>): Promise<Array<T>> {
        return this.listRaw({
            address: { $in: addresses },
            subscribed: true,
            isProjectActive: true,
            isClientActive: true,
        });
    }

    public async listBySubscribedAddress(
        address: string,
        clientId: string,
        projectId: string
    ): Promise<Array<T>> {
        return this.listRaw({
            address,
            clientId,
            projectId
        });
    }

    public async listBySubscribedAddressActiveOnly(
        address: string,
        clientId: string,
        projectId: string
    ): Promise<Array<T>> {
        return this.listRaw({
            address,
            clientId,
            projectId,
            subscribed: true,
            isProjectActive: true,
            isClientActive: true,
        });
    }

    public async setSubscribed(
        id: string,
        subscribed: boolean
    ): Promise<void> {
        await this.updateRaw({ id }, {
            $set: {
                subscribed
            }
        });
    }

    public async setSubscribedByClientId(clientId: string, subscribed: boolean): Promise<void> {
        await this.updateRaw({ clientId }, {
            $set: {
                subscribed
            }
        });
    }

    public async setSubscribedByProjectId(projectId: string, subscribed: boolean): Promise<void> {
        await this.updateRaw({ projectId }, {
            $set: {
                subscribed
            }
        });
    }

    public async setClientActive(clientId: string, isActive: boolean): Promise<void> {
        await this.updateRaw({ clientId }, {
            $set: {
                isClientActive: isActive
            }
        });
    }

    public async setProjectActive(projectId: string, isActive: boolean): Promise<void> {
        await this.updateRaw({ projectId }, {
            $set: {
                isProjectActive: isActive
            }
        });
    }
}
