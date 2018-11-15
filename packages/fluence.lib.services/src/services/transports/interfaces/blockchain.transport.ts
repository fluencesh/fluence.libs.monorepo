import { BigNumber } from 'bignumber.js';
import { Scheme } from '../../..';

export interface BlockchainTransport<
    Transaction extends Scheme.BlockchainTransaction,
    Block extends Scheme.BlockchainBlock<Transaction>
> {
    getBlockchainId(): string;
    getNetworkId(): string;

    getBlockHeight(transportConnectionId?: string): Promise<number>;
    getBlockByHash(blockHash: string, transportConnectionId?: string): Promise<Block>;
    getBlockByHeight(blockHeight: number, transportConnectionId?: string): Promise<Block>;
    getTransactionByHash(txHash: string, transportConnectionId?: string): Promise<Transaction>;
    sendRawTransaction(txHex: string, transportConnectionId?: string): Promise<Transaction>;
    getBalance(address: string, minConf: number, transportConnectionId?: string): Promise<BigNumber>;

    estimateFee(tx: Transaction, transportConnectionId?: string): Promise<BigNumber>;
}
