import { Plugin } from '@applicature/synth.mongodb';
import {Hashtable, PluginManager, Service} from '@applicature/synth.plugin-manager';
import { DaoIds } from '../../constants';
import { EthereumEventLogDao } from '../../dao/ethereum.event.log.dao';
import { Scheme } from '../../types';

export class EthereumEventLogService extends Service {
    protected ethereumEventLogDao: EthereumEventLogDao;

    constructor(pluginManager: PluginManager) {
        super(pluginManager);
    }

    public async init(): Promise<void> {
        const mongodbPlugin = this.pluginManager.get('mongodb') as any as Plugin;

        this.ethereumEventLogDao = await
            mongodbPlugin.getDao(DaoIds.EthereumEventLog) as EthereumEventLogDao;
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
    ): Promise<Scheme.EthereumEventLog> {
        return this.ethereumEventLogDao.createEvent(
            blockChainId, networkId,
            blockHash, blockHeight, blockTime,
            txHash,
            address,
            event, eventHash,
            params
        );
    }

    public async getById(id: string): Promise<Scheme.EthereumEventLog> {
        return this.ethereumEventLogDao.getById(id);
    }

    public async listByIds(ids: Array<string>): Promise<Array<Scheme.EthereumEventLog>> {
        return this.ethereumEventLogDao.listByIds(ids);
    }
}
