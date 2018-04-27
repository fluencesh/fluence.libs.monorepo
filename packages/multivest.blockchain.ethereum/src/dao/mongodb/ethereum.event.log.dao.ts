import { Hashtable } from '@applicature/multivest.core';
import { MongoDBDao } from '@applicature/multivest.mongodb';
import { EthereumEventLog } from '../../types';
import { EthereumEventLogDao } from '../ethereum.event.log.dao';

export class MongodbEthereumEventLogDao extends MongoDBDao<EthereumEventLog> implements EthereumEventLogDao {
    public getDaoId() {
        return 'ethereumEvents';
    }

    public getCollectionName() {
        return 'ethereumEvents';
    }

    public getDefaultValue() {
        return {} as EthereumEventLog;
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
        return this.create({
            blockChainId,
            networkId,

            blockHash,
            blockHeight,
            blockTime,

            txHash,

            address,

            event,
            eventHash,

            params,

            createdAt: new Date()
        });
    }

    public async getById(id: string): Promise<EthereumEventLog> {
        return this.getRaw({ id });
    }

    public async listByIds(ids: Array<string>): Promise<Array<EthereumEventLog>> {
        return this.listRaw({ id: {$in: ids} });
    }
}
