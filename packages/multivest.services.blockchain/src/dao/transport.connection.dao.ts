import { Dao } from '@applicature/multivest.core';
import { Scheme } from '../types';

export abstract class TransportConnectionDao extends Dao<Scheme.TransportConnection> {
    public abstract getById(
        id: string
    ): Promise<Scheme.TransportConnection>;

    public abstract listByBlockchainAndNetwork(
        blockchainId: string,
        networkId: string
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
        failedCount: number
    ): Promise<Scheme.TransportConnection>;

    public abstract async setSettings(
        id: string,
        settings: any
    ): Promise<void>;

    public abstract async setStatus(
        id: string,
        status: Scheme.TransportConnectionStatus
    ): Promise<void>;

    public abstract async setFailed(
        id: string,
        isFailed: boolean, at: Date
    ): Promise<void>;

    public abstract async setFailedByIds(
        ids: Array<string>,
        isFailing: boolean,
        at: Date
    ): Promise<void>;
}
