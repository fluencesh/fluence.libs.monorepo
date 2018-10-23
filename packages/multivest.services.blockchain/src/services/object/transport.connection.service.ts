import { PluginManager, Service } from '@fluencesh/multivest.core';
import { Plugin } from '@fluencesh/multivest.mongodb';
import { DaoIds } from '../../constants';
import { TransportConnectionDao } from '../../dao';
import { Scheme } from '../../types';

export class TransportConnectionService extends Service {
    protected transportConnectionDao: TransportConnectionDao;

    constructor(pluginManager: PluginManager) {
        super(pluginManager);
    }

    public getServiceId() {
        return 'transport.connection.service';
    }

    public async init(): Promise<void> {
        const mongodbPlugin = this.pluginManager.get('mongodb') as any as Plugin;

        this.transportConnectionDao = await mongodbPlugin.getDao(DaoIds.TransportConnection) as TransportConnectionDao;
    }

    public getById(id: string): Promise<Scheme.TransportConnection> {
        return this.transportConnectionDao.getById(id);
    }

    public getByBlockchainIdAndNetworkIdAndProviderId(
        blockchainId: string,
        networkId: string,
        providerId: string
    ): Promise<Scheme.TransportConnection> {
        return this.transportConnectionDao.getByBlockchainIdAndNetworkIdAndProviderId(
            blockchainId,
            networkId,
            providerId
        );
    }

    public listByBlockchainAndNetwork(
        blockchainId: string,
        networkId: string
    ): Promise<Array<Scheme.TransportConnection>> {
        return this.transportConnectionDao.listByBlockchainAndNetwork(
            blockchainId,
            networkId
        );
    }

    public listByBlockchainAndNetworkAndStatus(
        blockchainId: string,
        networkId: string,
        status: Scheme.TransportConnectionStatus
    ): Promise<Array<Scheme.TransportConnection>> {
        return this.transportConnectionDao.listByBlockchainAndNetworkAndStatus(
            blockchainId,
            networkId,
            status
        );
    }

    public listByIsPredefinedStatusAndBlockchainInfo(
        isPredefinedBySystem: boolean,
        blockchainId?: string,
        networkId?: string
    ): Promise<Array<Scheme.TransportConnection>> {
        return this.transportConnectionDao.listByIsPredefinedStatusAndBlockchainInfo(
            isPredefinedBySystem,
            blockchainId,
            networkId
        );
    }

    public listByBlockchainAndNetworkAndStatusAndCreatedAt(
        blockchainId: string,
        networkId: string,
        status: Scheme.TransportConnectionStatus,
        createdAt: Date,
        createdAtComparisonOperator: Scheme.ComparisonOperators
    ): Promise<Array<Scheme.TransportConnection>> {
        return this.transportConnectionDao.listByBlockchainAndNetworkAndStatusAndCreatedAt(
            blockchainId,
            networkId,
            status,
            createdAt,
            createdAtComparisonOperator
        );
    }

    public createTransportConnection(
        blockchainId: string,
        networkId: string,
        providerId: string,

        priority: number,

        settings: any,

        status: Scheme.TransportConnectionStatus,

        isFailing: boolean,
        lastFailedAt: Date,
        failedCount: number,

        isPrivate: boolean
    ): Promise<Scheme.TransportConnection> {
        return this.transportConnectionDao.createTransportConnection(
            blockchainId,
            networkId,
            providerId,
    
            priority,
    
            settings,
    
            status,
    
            isFailing,
            lastFailedAt,
            failedCount,

            isPrivate
        );
    }

    public async setSettings(
        id: string,
        settings: any
    ) {
        await this.transportConnectionDao.setSettings(id, settings);
    }

    public async setStatus(
        id: string,
        status: Scheme.TransportConnectionStatus
    ) {
        await this.transportConnectionDao.setStatus(id, status);
    }

    public async setStatusByIds(
        ids: Array<string>,
        status: Scheme.TransportConnectionStatus
    ) {
        await this.transportConnectionDao.setStatusByIds(ids, status);
    }

    public async setFailed(
        id: string,
        isFailing: boolean,
        at: Date
    ) {
        await this.transportConnectionDao.setFailed(id, isFailing, at);
    }

    public async setFailedByIds(
        ids: Array<string>,
        isFailing: boolean,
        at: Date
    ) {
        await this.transportConnectionDao.setFailedByIds(ids, isFailing, at);
    }

    public async removeById(id: string): Promise<void> {
        await this.transportConnectionDao.removeById(id);
    }

    public async removeByIds(idsToRemove: Array<string>): Promise<void> {
        await this.transportConnectionDao.removeByIds(idsToRemove);
    }
}
