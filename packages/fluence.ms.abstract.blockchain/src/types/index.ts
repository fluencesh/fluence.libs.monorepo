import { Scheme } from '@fluencesh/fluence.lib.services';
import { Hashtable } from '@applicature/core.plugin-manager';

export enum BlockchainNodeMetricType {
    Total = 'TOTAL',
    Healthy = 'HEALTHY',
    Unhealthy = 'UNHEALTHY',
}

export enum TransactionSendStatusMetricType {
    Success = 'SUCCESS',
    Fail = 'FAIL',
}

export interface BlockchainListenerJobMessage {
    transportConnectionId: string;
}

export interface BlockchainListenerJob extends Scheme.Job {
    params: TransportConnectionData;
}

export interface TransportConnectionData {
    lastProcessedBlock: number;
    failedBlocks: Array<number>;
    handlersData: Hashtable<HandlerData>;
}

export interface HandlerData {
    failedBlocks: Array<number>;
}
