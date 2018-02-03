import { Transaction } from '@applicature/multivest.core';
import { Hashtable } from '@applicature/multivest.core';

export const ETHEREUM = 'ETHEREUM';

export interface EthereumTransaction extends Transaction {
    gas: number;
    gasPrice: number;
    nonce: number;
    input: string;
}

export interface EthereumEvent {
    address: string;
    args: Hashtable<any>;
    blockHash: string;
    blockNumber: number;
    logIndex: number;
    event: string;
    removed: boolean;
    transactionIndex: number;
    transactionHash: string;
}
