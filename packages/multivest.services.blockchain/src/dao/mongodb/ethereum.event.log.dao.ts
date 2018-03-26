import { Hashtable } from '@applicature/multivest.core';
import { MongoDBDao } from '@applicature/multivest.mongodb';
import { Scheme } from '../../types';
import { EthereumEventLogDao } from '../ethereum.event.log.dao';

export class MongodbEthereumEventLogDao extends MongoDBDao<Scheme.EthereumEventLog> implements EthereumEventLogDao {
    public getDaoId() {
        return 'ethereumEvents';
    }

    public getCollectionName() {
        return 'ethereumEvents';
    }

    public getDefaultValue() {
        return {} as Scheme.EthereumEventLog;
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

    public async getById(id: string): Promise<Scheme.EthereumEventLog> {
        return this.getRaw({ id });
    }

    public async listByIds(ids: Array<string>): Promise<Scheme.EthereumEventLog> {
        return this.getRaw({ id: {$in: ids} });
    }
}
