import {Dao} from '@applicature/core.plugin-manager';
import { Scheme } from '../types';

export abstract class TransactionDao extends Dao<Scheme.Transaction> {
    public abstract async createTransaction(
        blockChainId: string,
        networkId: string,
        uniqId: string,
        transaction: Partial<Scheme.BlockchainTransaction>,
        status: Scheme.TransactionStatus
    ): Promise<Scheme.Transaction>;

    public abstract async setMinedBlock(
        blockChainId: string, networkId: string, txHash: string, hash: string,
        height: number, time: number
    ): Promise<void>;

    public abstract async getByHash(hash: string): Promise<Scheme.Transaction>;

    public abstract async getByUniqId(uniqId: string): Promise<Scheme.Transaction>;

    public abstract async getByBlockchainAndUniqId(
        blockchainId: string, networkId: string, uniqId: string
    ): Promise<Scheme.Transaction>;

    public abstract async listByNetworkAndStatus(
        blockchainId: string, networkId: string, status: Scheme.TransactionStatus
    ): Promise<Array<Scheme.Transaction>>;

    public abstract async listByUniqId(
        blockchainId: string, networkId: string, uniqId: string
    ): Promise<Array<Scheme.Transaction>>;

    public abstract async getCountByAddress(blockchainId: string, networkId: string, address: string): Promise<number>;

    public abstract async getCountByAddressExcludingStatus(
        blockchainId: string, networkId: string,
        address: string,
        status: Scheme.TransactionStatus
    ): Promise<number>;

    public abstract async setHashAndStatus(
        id: string, txHash: string, status: Scheme.TransactionStatus
    ): Promise<void>;
}
