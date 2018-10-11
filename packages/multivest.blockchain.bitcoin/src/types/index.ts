import {
  Block,
  Hashtable,
  Transaction
} from '@applicature-private/multivest.core';
import { MongoScheme } from '@applicature-private/multivest.mongodb';
import BigNumber from 'bignumber.js';

export const ETHEREUM = 'ETHEREUM';

export const ethereumValidNetworks: Array<string> = [
  'homestead',
  'ropsten',
  'rinkeby',
  'kovan'
];
export const ethereumNetworkToChainId: Hashtable<number> = {
  homestead: 0,
  ropsten: 1,
  rinkeby: 3,
  kovan: 4
};

export interface EthereumTransaction extends Transaction {
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

export interface EthereumBlock extends Block {
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

export interface BitcoinBlock {
  height: number;
  hash: string;
  parentHash?: string;
  difficulty?: number;
  nonce: any;
  size: number;
  time: number;
  network: string;
  fee: BigNumber;
  transactions: Array<Transaction>;
}

export interface BitcoinTransaction {
  hash: string;
  blockHash?: string;
  blockHeight?: number;
  blockTime?: number;
  fee: BigNumber;
  from: Array<Sender>;
  to: Array<Recipient>;
}

export interface Sender {
  address: string;
}

export interface Recipient {
  address: string;
  amount: BigNumber;
}

export enum OraclizeStatus {
  ENABLED = 'ENABLED',
  DISABLED = 'DISABLED'
}

export interface OraclizeSubscription extends MongoScheme {
  projectId: string;
  eventHash: string;
  eventName: string;
  eventInputTypes: Array<string>;
  webhookUrl: string;
  status: OraclizeStatus;
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
      [method: string]: SwApiMethod;
    };
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
  responses: { [status: string]: SwApiMethodResponse };
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
