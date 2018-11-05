import { BigNumber } from 'bignumber.js';
import { Scheme } from '../../types';

export interface BlockchainTransport {
    getTransportId(): string;
    getBlockchainId(): string;
    getNetworkId(): string;

    getBlockHeight(transportConnectionId?: string): Promise<number>;
    getBlockByHash<T extends Scheme.BlockchainTransaction>(
        blockHash: string,
        transportConnectionId?: string
    ): Promise<Scheme.BlockchainBlock<T>>;
    getBlockByHeight<T extends Scheme.BlockchainTransaction>(
        blockHeight: number,
        transportConnectionId?: string
    ): Promise<Scheme.BlockchainBlock<T>>;
    getTransactionByHash<T extends Scheme.BlockchainTransaction>(
        txHash: string,
        transportConnectionId?: string
    ): Promise<T>;
    sendRawTransaction<T extends Scheme.BlockchainTransaction>(
        txHex: string,
        transportConnectionId?: string
    ): Promise<T>;
    getBalance(
        address: string,
        minConf: number,
        transportConnectionId?: string
    ): Promise<BigNumber>;
}
