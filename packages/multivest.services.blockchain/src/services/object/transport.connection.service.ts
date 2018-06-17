import { PluginManager, Service } from '@applicature/multivest.core';
import { Plugin } from '@applicature/multivest.mongodb';
import { DaoIds } from '../../constants';
import { TransportConnectionDao } from '../../dao/transport.connection.dao';
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
        const mongodbPlugin = this.pluginManager.get('mongodb') as Plugin;

        this.transportConnectionDao = await mongodbPlugin.getDao(DaoIds.TransportConnection) as TransportConnectionDao;
    }

    public getById(id: string): Promise<Scheme.TransportConnection> {
        return this.transportConnectionDao.getById(id);
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

    public createTransportConnection(
        blockchainId: string,
        networkId: string,
        providerId: string,

        priority: number,

        settings: any,

        status: Scheme.TransportConnectionStatus,

        isFailing: boolean,
        lastFailedAt: Date,
        failedCount: number
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
            failedCount
        );
    }

    public async setSettings(
        id: string,
        settings: any
    ) {
        await this.transportConnectionDao.setSettings(id, settings);

        return;
    }

    public async setStatus(
        id: string,
        status: Scheme.TransportConnectionStatus
    ) {
        await this.transportConnectionDao.setStatus(id, status);

        return;
    }

    public async setFailed(
        id: string,
        isFailing: boolean,
        at: Date
    ) {
        await this.transportConnectionDao.setFailed(id, isFailing, at);

        return;
    }

    public async setFailedByIds(
        ids: Array<string>,
        isFailing: boolean,
        at: Date
    ) {
        await this.transportConnectionDao.setFailedByIds(ids, isFailing, at);

        return;
    }
}
