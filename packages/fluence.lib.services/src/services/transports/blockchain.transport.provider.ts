import { BigNumber } from 'bignumber.js';
import { Scheme } from '../../..';
import { BlockchainTransport } from './blockchain.transport';

export interface BlockchainTransportProvider<Transaction extends Scheme.BlockchainTransaction>
    extends BlockchainTransport<Transaction> {

    getTransportConnection(): Scheme.TransportConnection;

    getBlockHeight(): Promise<number>;
    getBlockByHash(
        blockHash: string
    ): Promise<Scheme.BlockchainBlock<Transaction>>;
    getBlockByHeight(
        blockHeight: number
    ): Promise<Scheme.BlockchainBlock<Transaction>>;
    getTransactionByHash(
        txHash: string
    ): Promise<Transaction>;
    sendRawTransaction(
        txHex: string
    ): Promise<Transaction>;
    getBalance(
        address: string,
        minConf: number
    ): Promise<BigNumber>;
}
