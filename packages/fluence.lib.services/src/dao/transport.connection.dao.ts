import { Dao } from '@applicature/synth.plugin-manager';
import { Scheme } from '../types';

export abstract class TransportConnectionDao extends Dao<Scheme.TransportConnection> {
    public abstract getById(
        id: string
    ): Promise<Scheme.TransportConnection>;

    public abstract getByBlockchainIdAndNetworkIdAndProviderId(
        blockchainId: string,
        networkId: string,
        providerId: string
    ): Promise<Scheme.TransportConnection>;

    public abstract listByBlockchainAndNetwork(
        blockchainId: string,
        networkId: string
    ): Promise<Array<Scheme.TransportConnection>>;

    public abstract listByBlockchainAndNetworkAndStatus(
        blockchainId: string,
        networkId: string,
        status: Scheme.TransportConnectionStatus
    ): Promise<Array<Scheme.TransportConnection>>;

    public abstract listByBlockchainAndNetworkAndStatusAndCreatedAt(
        blockchainId: string,
        networkId: string,
        status: Scheme.TransportConnectionStatus,
        createdAt: Date,
        createdAtComparisonOperator: Scheme.ComparisonOperators
    ): Promise<Array<Scheme.TransportConnection>>;

    public abstract listByIsPredefinedStatusAndBlockchainInfo(
        isPredefinedBySystem: boolean,
        blockchainId?: string,
        networkId?: string
    ): Promise<Array<Scheme.TransportConnection>>;

    public abstract createTransportConnection(
        blockchainId: string,
        networkId: string,
        providerId: string,

        priority: number,

        settings: any,

        status: Scheme.TransportConnectionStatus,

        isFailing: boolean,
        lastFailedAt: Date,
        failedCount: number,

        isPrivate: boolean,

        cronExpression: string,

        isPredefinedBySystem?: boolean
    ): Promise<Scheme.TransportConnection>;

    public abstract async setSettings(
        id: string,
        settings: any
    ): Promise<void>;

    public abstract async setStatus(
        id: string,
        status: Scheme.TransportConnectionStatus
    ): Promise<void>;

    public abstract async setStatusByIds(
        ids: Array<string>,
        status: Scheme.TransportConnectionStatus
    ): Promise<void>;

    public abstract async setFailed(
        id: string,
        isFailed: boolean,
        at: Date
    ): Promise<void>;

    public abstract async setFailedByIds(
        ids: Array<string>,
        isFailing: boolean,
        at: Date
    ): Promise<void>;

    public abstract async removeById(id: string): Promise<void>;
    public abstract async removeByIds(ids: Array<string>): Promise<void>;
}
