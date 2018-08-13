import { PluginManager, Service, Transaction } from '@fluencesh/multivest.core';
import { Plugin } from '@fluencesh/multivest.mongodb';
import { DaoIds } from '../../constants';
import { TransactionDao } from '../../dao/transaction.dao';
import { Scheme } from '../../types';

export class TransactionService extends Service {
    protected transactionDao: TransactionDao;

    constructor(pluginManager: PluginManager) {
        super(pluginManager);
    }

    public async init(): Promise<void> {
        const mongodbPlugin = this.pluginManager.get('mongodb') as any as Plugin;

        this.transactionDao = await mongodbPlugin.getDao(DaoIds.Transaction) as TransactionDao;
    }

    public getServiceId(): string {
        return 'object.transactions';
    }

    public async createTransaction(
        blockChainId: string,
        networkId: string,
        uniqId: string,
        transaction: Transaction,
        status: Scheme.TransactionStatus
    ): Promise<Scheme.Transaction> {
        return this.transactionDao.createTransaction(blockChainId, networkId, uniqId, transaction, status);
    }

    public async setMinedBlock(
        blockChainId: string, networkId: string, txHash: string, hash: string,
        height: number, time: number
    ): Promise<void> {
        return this.transactionDao.setMinedBlock(blockChainId, networkId, txHash, hash, height, time);
    }

    public async getByHash(hash: string): Promise<Scheme.Transaction> {
        return this.transactionDao.getByHash(hash);
    }

    public async getByUniqId(uniqId: string): Promise<Scheme.Transaction> {
        return this.transactionDao.getByUniqId(uniqId);
    }

    public async getByBlockchainAndUniqId(
        blockChainId: string, networkId: string, uniqId: string
    ): Promise<Scheme.Transaction> {
        return this.transactionDao.getByBlockchainAndUniqId(blockChainId, networkId, uniqId);
    }

    public async listByNetworkAndStatus(
        blockChainId: string, networkId: string, status: Scheme.TransactionStatus
    ): Promise<Array<Scheme.Transaction>> {
        return this.transactionDao.listByNetworkAndStatus(blockChainId, networkId, status);
    }

    public async listByUniqId(
        blockChainId: string, networkId: string, uniqId: string
    ): Promise<Array<Scheme.Transaction>> {
        return this.transactionDao.listByUniqId(blockChainId, networkId, uniqId);
    }

    public async getCountByAddress(blockChainId: string, networkId: string, address: string): Promise<number> {
        return this.transactionDao.getCountByAddress(blockChainId, networkId, address);
    }

    public async getCountByAddressExcludingStatus(
        blockChainId: string,
        networkId: string,
        address: string,
        status: Scheme.TransactionStatus
    ): Promise<number> {
        return this.transactionDao.getCountByAddressExcludingStatus(blockChainId, networkId, address, status);
    }

    public async setHashAndStatus(
        id: string, txHash: string, status: Scheme.TransactionStatus
    ): Promise<void> {
        return this.transactionDao.setHashAndStatus(id, txHash, status);
    }
}
