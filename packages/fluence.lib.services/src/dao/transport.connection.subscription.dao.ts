import { Dao } from '@applicature-private/core.plugin-manager';
import { Scheme } from '../types';

// TODO: create MongoDBViewDao
export abstract class TransportConnectionSubscriptionDao extends Dao<Scheme.TransportConnectionSubscription> {
    public abstract getById(transportConnectionId: string): Promise<Scheme.TransportConnectionSubscription>;
    public abstract getByIdAndStatus(
        transportConnectionId: string,
        status: Scheme.TransportConnectionSubscriptionStatus
    ): Promise<Scheme.TransportConnectionSubscription>;

    public abstract list(): Promise<Array<Scheme.TransportConnectionSubscription>>;
    public abstract listByStatus(
        status: Scheme.TransportConnectionSubscriptionStatus
    ): Promise<Array<Scheme.TransportConnectionSubscription>>;

    public abstract listByIds(
        transportConnectionIds: Array<string>
    ): Promise<Array<Scheme.TransportConnectionSubscription>>;
    public abstract listByIdsAndStatus(
        transportConnectionIds: Array<string>,
        status: Scheme.TransportConnectionSubscriptionStatus
    ): Promise<Array<Scheme.TransportConnectionSubscription>>;

    public abstract listByBlockchainInfo(
        blockchainId: string,
        networkId?: string
    ): Promise<Array<Scheme.TransportConnectionSubscription>>;
    public abstract listByStatusAndBlockchainInfo(
        status: Scheme.TransportConnectionSubscriptionStatus,
        blockchainId: string,
        networkId?: string
    ): Promise<Array<Scheme.TransportConnectionSubscription>>;
}
