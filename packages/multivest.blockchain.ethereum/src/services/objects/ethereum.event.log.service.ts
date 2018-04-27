import {Hashtable, PluginManager, Service} from '@applicature/multivest.core';
import { Plugin } from '@applicature/multivest.mongodb';
import { EthereumEventLogDao } from '../../dao/ethereum.event.log.dao';
import { EthereumEventLog } from '../../types';

export class EthereumEventLogService extends Service {
    protected ethereumEventLogDao: EthereumEventLogDao;

    constructor(pluginManager: PluginManager) {
        super(pluginManager);
    }

    public async init(): Promise<void> {
        const mongodbPlugin = this.pluginManager.get('mongodb') as Plugin;

        this.ethereumEventLogDao = await
            mongodbPlugin.getDao('ethereumEvents') as EthereumEventLogDao;
    }

    public getServiceId(): string {
        return 'object.ethereumEvents';
    }

    public async createEvent(
        blockChainId: string,
        networkId: string,

        blockHash: string,
        blockHeight: number,
        blockTime: number,

        txHash: string,

        address: string,

        event: string,
        eventHash: string,

        params: Hashtable<any>
    ): Promise<EthereumEventLog> {
        return this.ethereumEventLogDao.createEvent(
            blockChainId, networkId,
            blockHash, blockHeight, blockTime,
            txHash,
            address,
            event, eventHash,
            params
        );
    }

    public async getById(id: string): Promise<EthereumEventLog> {
        return this.ethereumEventLogDao.getById(id);
    }

    public async listByIds(ids: Array<string>): Promise<Array<EthereumEventLog>> {
        return this.ethereumEventLogDao.listByIds(ids);
    }
}
