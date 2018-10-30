import {Hashtable} from '@applicature-private/core.plugin-manager';
import { MongoScheme } from '@applicature-private/core.mongodb';
import BigNumber from 'bignumber.js';
import {Scheme} from '@applicature-private/fluence.lib.services';

export interface BitcoinBlock extends Scheme.BlockchainBlock<Scheme.BlockchainTransaction> {

}

export interface BitcoinTransaction extends Scheme.BlockchainTransaction {
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
