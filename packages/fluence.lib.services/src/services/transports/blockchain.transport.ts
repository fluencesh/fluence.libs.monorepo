import { BigNumber } from 'bignumber.js';
import { Scheme } from '../../types';

export interface BlockchainTransport<Transaction extends Scheme.BlockchainTransaction> {
    getTransportId(): string;
    getBlockchainId(): string;
    getNetworkId(): string;

    getBlockHeight(transportConnectionId?: string): Promise<number>;
    getBlockByHash(
        blockHash: string,
        transportConnectionId?: string
    ): Promise<Scheme.BlockchainBlock<Transaction>>;
    getBlockByHeight(
        blockHeight: number,
        transportConnectionId?: string
    ): Promise<Scheme.BlockchainBlock<Transaction>>;
    getTransactionByHash(
        txHash: string,
        transportConnectionId?: string
    ): Promise<Transaction>;
    sendRawTransaction(
        txHex: string,
        transportConnectionId?: string
    ): Promise<Transaction>;
    getBalance(
        address: string,
        minConf: number,
        transportConnectionId?: string
    ): Promise<BigNumber>;
}
