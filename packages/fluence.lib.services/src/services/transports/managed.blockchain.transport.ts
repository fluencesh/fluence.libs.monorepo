import { BigNumber } from 'bignumber.js';
import { Scheme } from '../../types';
import { BlockchainTransport } from './blockchain.transport';

export interface ManagedBlockchainTransport<Transaction extends Scheme.BlockchainTransaction>
    extends BlockchainTransport<Transaction> {
    getBlockHeight(transportConnectionId: string): Promise<number>;
    getBlockByHash(
        blockHash: string,
        transportConnectionId: string
    ): Promise<Scheme.BlockchainBlock<Transaction>>;
    getBlockByHeight(
        blockHeight: number,
        transportConnectionId: string
    ): Promise<Scheme.BlockchainBlock<Transaction>>;
    getTransactionByHash(
        txHash: string,
        transportConnectionId: string
    ): Promise<Transaction>;
    sendRawTransaction(
        txHex: string,
        transportConnectionId: string
    ): Promise<Transaction>;
    getBalance(
        address: string,
        minConf: number,
        transportConnectionId: string
    ): Promise<BigNumber>;
}
