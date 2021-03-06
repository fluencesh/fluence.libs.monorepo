import {Dao, Hashtable} from '@applicature/synth.plugin-manager';
import { Scheme } from '../types';

export abstract class EthereumEventLogDao extends Dao<Scheme.EthereumEventLog> {
    public abstract async createEvent(
        blockchainId: string,
        networkId: string,

        blockHash: string,
        blockHeight: number,
        blockTime: number,

        txHash: string,

        address: string,

        event: string,
        eventHash: string,

        params: Hashtable<any>
    ): Promise<Scheme.EthereumEventLog>;

    public abstract async getById(id: string): Promise<Scheme.EthereumEventLog>;
    public abstract async listByIds(ids: Array<string>): Promise<Array<Scheme.EthereumEventLog>>;
}
