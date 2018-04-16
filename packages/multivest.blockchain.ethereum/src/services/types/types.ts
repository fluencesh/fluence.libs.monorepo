import { Transaction } from '@applicature/multivest.core';
import { Hashtable } from '@applicature/multivest.core';
import {Block} from '@applicature/multivest.core';

export const ETHEREUM = 'ETHEREUM';

export const ethereumValidNetworks: Array<string> = ['homestead', 'ropsten', 'rinkeby', 'kovan'];
export const ethereumNetworkToChainId: Hashtable<number> = {
    homestead: 0,
    ropsten: 1,
    rinkeby: 3,
    kovan: 4
};

export interface EthereumTransaction extends Transaction {
    gasLimit?: number;
    gasPrice?: number;
    nonce?: number;
    input?: string;
    transactionIndex?: string;
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

export interface EthereumBlock extends Block {
    sha3Uncles: string;
    logsBloom: string;
    transactionsRoot: string;
    stateRoot: string;
    receiptsRoot: string;
    miner: string;
    totalDifficulty: string;
    extraData: string;
    gasLimit: string;
    gasUsed: string;
    uncles: string;
}

export interface EthereumTransactionReceipt {
    blockHash: string;
    blockNumber: number;
    contractAddress: string;
    cumulativeGasUsed: number;
    from: string;
    gasUsed: number;
    logs: Array<EthereumTopic>;
    logsBloom: string;
    root: string;
    to: string;
    transactionHash: string;
    transactionIndex: number;
}

export interface EthereumTopic {
    address: string;
    topics: Array<string>;
    data: string;
    blockNumber: number;
    transactionHash: string;
    transactionIndex: number;
    blockHash: string;
    logIndex: number;
    removed: boolean;
}

export interface EthereumContract {
    address: string;
    abi: Array<EthereumContractItem>;
}

export interface EthereumContractItem {
    anonymous?: boolean;
    constant?: boolean;

    inputs: Array<EthereumContractItemNameType>;
    name: string;
    outputs?: Array<EthereumContractItemNameType>;
    type: string;
}

export interface EthereumContractItemNameType {
    name: string;
    type: string;
    indexed: boolean;
}
