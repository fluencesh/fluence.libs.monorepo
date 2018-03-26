import {Hashtable, PluginManager, Service} from '@applicature/multivest.core';
import { EthereumEventLogDao } from '../../dao/ethereum.event.log.dao';
import { Scheme } from '../../types';

export class EthereumEventLogService extends Service {
    protected ethereumEventLogDao: EthereumEventLogDao;

    constructor(pluginManager: PluginManager) {
        super(pluginManager);

        // @TODO: set ethereumEventLogDao
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

    public async listByIds(ids: Array<string>): Promise<Scheme.EthereumEventLog> {
        return this.ethereumEventLogDao.listByIds(ids);
    }
}
