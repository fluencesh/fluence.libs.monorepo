import {Hashtable} from '@applicature/core.plugin-manager';
import BigNumber from 'bignumber.js';
import {Scheme} from '@fluencesh/fluence.lib.services';

export const ETHEREUM = 'ETHEREUM';

export const ethereumValidNetworks: Array<string> = ['homestead', 'ropsten', 'rinkeby', 'kovan'];
export const ethereumNetworkToChainId: Hashtable<number> = {
    homestead: 0,
    ropsten: 1,
    rinkeby: 3,
    kovan: 4
};

export interface EthereumTransaction extends Scheme.BlockchainTransaction {
    gasLimit?: BigNumber;
    gasPrice?: BigNumber;
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

export interface EthereumBlock extends Scheme.BlockchainBlock {
    sha3Uncles: string;
    logsBloom: string;
    transactionsRoot: string;
    stateRoot: string;
    receiptsRoot: string;
    miner: string;
    totalDifficulty: string;
    extraData: string;
    gasLimit: BigNumber;
    gasUsed: BigNumber;
    uncles: string;
    transactions: Array<EthereumTransaction>;
}

export interface EthereumTransactionReceipt {
    blockHash: string;
    blockNumber: number;
    byzantium: boolean;
    contractAddress: string;
    cumulativeGasUsed: BigNumber;
    from: string;
    gasUsed: BigNumber;
    logs: Array<EthereumTopic>;
    logsBloom: string;
    root: string;
    transactionHash: string;
    transactionIndex: number;
    status: number;
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

export interface EthereumTopicFilter {
    fromBlock?: number;
    toBlock?: number;
    address?: string;
    topics?: Array<string>;
}

//#region SW types
export enum SwFormat {
    YAML = 'YAML',
    JSON = 'JSON'
}

export interface GeneratorOptions {
    pathname?: string;
    https?: boolean;
}

export interface SwApi {
    swagger: string;
    info?: SwApiInfo;
    host: string;
    basePath: string;
    schemes: Array<string>;
    consumes: Array<string>;
    produces: Array<string>;
    paths: {
        [path: string]: {
            [ method: string ]: SwApiMethod
        }
    };
}

export interface SwApiInfo {
    version?: string;
    title?: string;
    description?: string;
    termsOfService?: string;
    contact: SwApiContact;
    license: SwApiLicense;
}

export interface SwApiContact {
    name: string;
}

export interface SwApiLicense {
    name: string;
}

export interface SwApiMethod {
    description?: string;
    operationId?: string;
    produces?: Array<string>;
    parameters: Array<SwApiMethodParameter>;
    responses: { [ status: string ]: SwApiMethodResponse };
}

export interface SwApiMethodParameter {
    name: string;
    in: string;
    description?: string;
    required?: boolean;
    type: string;
    items?: SwApiMethodArray;
    collectionFormat?: string;
}

export interface SwApiMethodResponse {
    description?: string;
    schema: SwApiMethodResponseSchema;
}

export interface SwApiMethodResponseSchema {
    type: string;
    properties?: any;
    items?: SwApiMethodArray;
}

export interface SwApiMethodArray {
    type?: string;
    $ref?: string;
}
//#endregion
