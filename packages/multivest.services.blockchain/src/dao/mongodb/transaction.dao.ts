import { Transaction } from '@applicature/multivest.core';
import { MongoDBDao } from '@applicature/multivest.mongodb';
import { Scheme } from '../../types';
import { TransactionDao } from '../transaction.dao';

export class MongodbTransactionDao extends MongoDBDao<Scheme.Transaction> implements TransactionDao {
    public getDaoId() {
        return 'transactions';
    }

    public getCollectionName() {
        return 'transactions';
    }

    public getDefaultValue() {
        return {} as Scheme.Transaction;
    }

    public async createTransaction(
        blockChainId: string, networkId: string, uniqId: string,
        transaction: Transaction, status: Scheme.TransactionStatus
    ): Promise<Scheme.Transaction> {

        return this.create({
            blockChainId,
            networkId,
            ref: transaction,
            status,
            uniqId,
        });
    }

    public async setMinedBlock(
        blockChainId: string, networkId: string, txHash: string, hash: string,
        height: number, time: number
    ): Promise<void> {
        await this.collection
            .updateOne(
                {
                    blockChainId,
                    networkId,
                    'ref.hash': txHash,
                },
                {
                    $set: {
                        'ref.blockHash': hash,
                        'ref.blockHeight': height,
                        'ref.blockTime': time,
                        'status': Scheme.TransactionStatus.Mined,
                    },
                }
            )
            .then(() => ({}));
    }

    public async getByHash(hash: string): Promise<Scheme.Transaction> {
        return this.getRaw({
            'ref.hash': hash,
        });
    }

    public async getByUniqId(uniqId: string): Promise<Scheme.Transaction> {
        return this.get({
            uniqId,
        });
    }

    public async getByBlockchainAndUniqId(
        blockChainId: string, networkId: string, uniqId: string
    ): Promise<Scheme.Transaction> {
        return this.getRaw({
            blockChainId, networkId,
            uniqId,
        });
    }

    public async listByNetworkAndStatus(
        blockChainId: string, networkId: string, status: Scheme.TransactionStatus
    ): Promise<Array<Scheme.Transaction>> {

        return this.list({
            blockChainId,
            networkId,
            status,
        });
    }

    public async listByUniqId(
        blockChainId: string, networkId: string, uniqId: string
    ): Promise<Array<Scheme.Transaction>> {
        return this.listRaw({
            blockChainId, networkId,
            uniqId,
        });
    }

    public async getCountByAddress(blockChainId: string, networkId: string, address: string): Promise<number> {
        return this.collection.count({
            blockChainId, networkId,
            'ref.from': {
                $elemMatch: {
                    address,
                },
            },
        });
    }

    public async getCountByAddressExcludingStatus(
        blockChainId: string, networkId: string, address: string,  status: Scheme.TransactionStatus
    ): Promise<number> {
        return this.collection.count({
            blockChainId, networkId,
            'ref.from': {
                $elemMatch: {
                    address,
                },
            },
            'status': {
                $ne: status
            }
        });
    }

    public async setHashAndStatus(id: string, txHash: string, status: Scheme.TransactionStatus): Promise<void> {
        await this.collection.updateOne(
            {
                id,
            },
            {
                $set: {
                    'ref.hash': txHash,
                    status,
                },
            }
        )
        .then(() => ({}));
    }
}
