import { Scheme } from '@applicature-private/fluence.lib.services';
import { Hashtable } from '@applicature-private/core.plugin-manager';

export enum BlockchainNodeMetricType {
    Total = 'TOTAL',
    Healthy = 'HEALTHY',
    Unhealthy = 'UNHEALTHY',
}

export enum TransactionSendStatusMetricType {
    Success = 'SUCCESS',
    Fail = 'FAIL',
}

export interface BlockchainListenerJob extends Scheme.Job {
    params: Hashtable<TransportConnectionData>;
}

export interface TransportConnectionData {
    lastProcessedBlock: number;
    failedBlocks: Array<number>;
    handlersData: Hashtable<HandlerData>;
}

export interface HandlerData {
    failedBlocks: Array<number>;
}
