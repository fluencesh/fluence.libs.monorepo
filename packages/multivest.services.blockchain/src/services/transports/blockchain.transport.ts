import { Block, PluginManager, Service, Transaction } from '@applicature-private/multivest.core';
import { BigNumber } from 'bignumber.js';
import { Scheme } from '../../..';

export interface BlockchainTransport {
    getTransportConnection(): Scheme.TransportConnection;
    getTransportId(): string;
    getBlockchainId(): string;
    getNetworkId(): string;
    getBlockHeight(): Promise<number>;
    getBlockByHash(blockHash: string): Promise<Block>;
    getBlockByHeight(blockHeight: number): Promise<Block>;
    getTransactionByHash(txHash: string): Promise<Transaction>;
    sendRawTransaction(txHex: string, ): Promise<Transaction>;
    getBalance(address: string, minConf: number): Promise<BigNumber>;
}
