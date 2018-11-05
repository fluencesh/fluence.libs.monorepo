import { BigNumber } from 'bignumber.js';
import { Scheme } from '../../..';
import { BlockchainTransport } from './blockchain.transport';

export interface BlockchainTransportProvider extends BlockchainTransport {
    getTransportConnection(): Scheme.TransportConnection;

    getBlockHeight(): Promise<number>;
    getBlockByHash<T extends Scheme.BlockchainTransaction>(
        blockHash: string
    ): Promise<Scheme.BlockchainBlock<T>>;
    getBlockByHeight<T extends Scheme.BlockchainTransaction>(
        blockHeight: number
    ): Promise<Scheme.BlockchainBlock<T>>;
    getTransactionByHash<T extends Scheme.BlockchainTransaction>(
        txHash: string
    ): Promise<T>;
    sendRawTransaction<T extends Scheme.BlockchainTransaction>(
        txHex: string
    ): Promise<T>;
    getBalance(
        address: string,
        minConf: number
    ): Promise<BigNumber>;
}
