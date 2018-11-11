import { BigNumber } from 'bignumber.js';
import { Scheme } from '../../..';
import { BlockchainTransport } from './blockchain.transport';
import { BlockchainTransportProvider } from './blockchain.transport.provider';

export interface ManagedBlockchainTransport<
    Transaction extends Scheme.BlockchainTransaction,
    Block extends Scheme.BlockchainBlock<Transaction>,
    Provider extends BlockchainTransportProvider<Transaction, Block>
> extends BlockchainTransport<Transaction, Block> {
    getStatistic(): Scheme.ManagedBlockchainTransportStatistic;

    getBlockHeight(transportConnectionId: string): Promise<number>;
    getBlockByHash(blockHash: string, transportConnectionId: string): Promise<Block>;
    getBlockByHeight(blockHeight: number, transportConnectionId: string): Promise<Block>;
    getTransactionByHash(txHash: string, transportConnectionId: string): Promise<Transaction>;
    sendRawTransaction(txHex: string, transportConnectionId: string): Promise<Transaction>;
    getBalance(address: string, minConf: number, transportConnectionId: string): Promise<BigNumber>;
}
