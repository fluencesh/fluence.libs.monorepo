import { Dao } from '@applicature/synth.plugin-manager';
import { Scheme } from '../types';

export abstract class SubscriptionBlockRecheckDao extends Dao<Scheme.SubscriptionBlockRecheck> {
    public abstract createBlockRecheck(
        subscriptionId: string,
        transportConnectionId: string,
        type: Scheme.SubscriptionBlockRecheckType,
        blockHash: string,
        blockHeight: number,
        invokeOnBlockHeight: number,
        webhookActionItem: Scheme.WebhookActionItem
    ): Promise<Scheme.SubscriptionBlockRecheck>;

    public abstract getById(id: string): Promise<Scheme.SubscriptionBlockRecheck>;
    public abstract getByUniqueInfo(
        subscriptionId: string,
        transportConnectionId: string,
        type: Scheme.SubscriptionBlockRecheckType,
        blockHash: string,
        blockHeight: number
    ): Promise<Scheme.SubscriptionBlockRecheck>;

    public abstract listByBlockHeight(height: number): Promise<Array<Scheme.SubscriptionBlockRecheck>>;
    public abstract listByBlockHeightAndTransportConnectionId(
        height: number,
        transportConnectionId: string
    ): Promise<Array<Scheme.SubscriptionBlockRecheck>>;

    public abstract listByBlockHeightAndTransportConnectionIdAndType(
        height: number,
        transportConnectionId: string,
        type: Scheme.SubscriptionBlockRecheckType
    ): Promise<Array<Scheme.SubscriptionBlockRecheck>>;

    public abstract listOnBlockByTransportAndType(
        invokeOnBlockHeight: number,
        transportConnectionId: string,
        type: Scheme.SubscriptionBlockRecheckType
    ): Promise<Array<Scheme.SubscriptionBlockRecheck>>;

    public abstract incInvokeOnBlockHeightById(id: string, incrementOn?: number): Promise<void>;
    public abstract incInvokeOnBlockHeightByIds(id: Array<string>, incrementOn?: number): Promise<void>;

    public abstract setInvokeOnBlockHeightById(id: string, invokeOnBlockHeight: number): Promise<void>;

    public abstract removeById(id: string): Promise<void>;
    public abstract removeByIds(ids: Array<string>): Promise<void>;
}
