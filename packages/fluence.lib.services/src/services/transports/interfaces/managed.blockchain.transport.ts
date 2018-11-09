import { BigNumber } from 'bignumber.js';
import { Scheme } from '../../..';
import { BlockchainTransport } from './blockchain.transport';

export interface ManagedBlockchainTransport<
    Transaction extends Scheme.BlockchainTransaction,
    Block extends Scheme.BlockchainBlock<Transaction>
> extends BlockchainTransport<Transaction, Block> {
    getBlockHeight(transportConnectionId: string): Promise<number>;
    getBlockByHash(blockHash: string, transportConnectionId: string): Promise<Block>;
    getBlockByHeight(blockHeight: number, transportConnectionId: string): Promise<Block>;
    getTransactionByHash(txHash: string, transportConnectionId: string): Promise<Transaction>;
    sendRawTransaction(txHex: string, transportConnectionId: string): Promise<Transaction>;
    getBalance(address: string, minConf: number, transportConnectionId: string): Promise<BigNumber>;
}
