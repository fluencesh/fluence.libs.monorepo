import { BigNumber } from 'bignumber.js';
import { Scheme } from '../../..';
import { BlockchainTransport } from './blockchain.transport';

export interface BlockchainTransportProvider<
    Transaction extends Scheme.BlockchainTransaction,
    Block extends Scheme.BlockchainBlock<Transaction>
> extends BlockchainTransport<Transaction, Block> {
    getTransportConnection(): Scheme.TransportConnection;
    getTransportId(): string;

    getBlockHeight(): Promise<number>;
    getBlockByHash(blockHash: string): Promise<Block>;
    getBlockByHeight(blockHeight: number): Promise<Block>;
    getTransactionByHash(txHash: string): Promise<Transaction>;
    sendRawTransaction(txHex: string): Promise<Transaction>;
    getBalance(address: string, minConf: number): Promise<BigNumber>;
}
