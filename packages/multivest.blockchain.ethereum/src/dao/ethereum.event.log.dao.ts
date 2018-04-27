import {Dao, Hashtable} from '@applicature/multivest.core';
import { EthereumEventLog } from '../types';

export abstract class EthereumEventLogDao extends Dao<EthereumEventLog> {
    public abstract async createEvent(
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
    ): Promise<EthereumEventLog>;

    public abstract async getById(id: string): Promise<EthereumEventLog>;
    public abstract async listByIds(ids: Array<string>): Promise<Array<EthereumEventLog>>;
}
