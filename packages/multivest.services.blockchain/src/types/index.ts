import * as Blockchain from '@applicature/multivest.core';
import { Hashtable } from '@applicature/multivest.core';
import { MongoScheme } from '@applicature/multivest.mongodb';
import {WebhookTransportInstance} from 'winston';

// tslint:disable-next-line:no-namespace
export namespace Scheme {

    export enum ClientStatus {
        Active = 'ACTIVE',
        Inactive = 'INACTIVE'
    }

    export interface Client extends MongoScheme {
        ethereumAddress: string;

        status: ClientStatus;

        createdAt: Date;
    }

    export interface Job extends MongoScheme {
        params: Hashtable<any>;
    }

    export enum ProjectStatus {
        Active = 'ACTIVE',
        Inactive = 'INACTIVE'
    }

    export interface Project extends MongoScheme {
        clientId: string;

        name: string;

        status: ProjectStatus;

        webhookUrl: string;
        failedRetryCount: number;

        apiKey: string;

        sharedSecret: string;

        createdAt: Date;
    }

    export interface Subscription extends MongoScheme {
        clientId: string;
        projectId: string;

        blockChainId: string;
        networkId: string;

        minConfirmations: number;

        subscribed: boolean;
        isProjectActive: boolean;
        isClientActive: boolean;

        createdAt: Date;
    }

    export interface AddressSubscription extends Subscription {
        address: string;
    }

    export interface TransactionHashSubscription extends Subscription {
        hash: string;
    }

    export interface Transaction extends MongoScheme {
        ref: Partial<Blockchain.Transaction>;

        blockChainId: string;
        networkId: string;

        uniqId: string;
        status: TransactionStatus;
    }

    export enum TransactionStatus {
        Created = 'CREATED',
        Sent = 'SENT',
        Mined = 'MINED',
    }

    export enum WebhookReportItemStatus {
        Created = 'CREATED',
        Failed = 'FAILED',
        Sent = 'SENT'
    }

    export enum WebhookTriggerType {
        Address = 'ADDRESS',
        EthereumContractEvent = 'ETHEREUM_CONTRACT_EVENT',
        Transaction = 'TRANSACTION'
    }

    export interface WebhookActionItem extends MongoScheme {
        webhookUrl: string;

        clientId: string;
        projectId: string;

        blockChainId: string;
        networkId: string;

        blockHash: string;
        blockHeight: number;
        blockTime: number;

        minConfirmations: number;
        confirmations: number;

        txHash: string;

        address: string;

        type: WebhookTriggerType;
        refId: string; // AddressSubscription id or EthereumContractSubscription id

        eventId: string;
        params: Hashtable<any>;

        failedCount: number;
        lastFailedAt: Date;

        fails: Array<WebhookFailedReport>;

        status: Scheme.WebhookReportItemStatus;

        createdAt: Date;
    }

    export interface WebhookFailedReport {
        request: {
            method: string;
            headers: Hashtable<string>,
            data: Hashtable<any>;
        };

        response?: {
            data: any,

            status: number,

            statusText: string,

            headers: Hashtable<string>
        };

        error?: any;

        createdAt: Date;
    }

    export enum TransportConnectionStatus {
        Enabled = 'ENABLED',
        Disabled = 'DISABLED'
    }
    export interface TransportConnection extends MongoScheme {
        blockchainId: string;
        networkId: string;
        providerId: string;

        priority: number;

        settings: any;

        status: TransportConnectionStatus;

        isFailing: boolean;
        lastFailedAt: Date;
        failedCount: number;

        createdAt: Date;
    }
}
