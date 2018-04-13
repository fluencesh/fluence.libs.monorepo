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

        webHookUrl: string;
        failedRetryCount: number;

        sharedSecret: string;

        createdAt: Date;
    }

    export interface AddressSubscription extends MongoScheme {
        clientId: string;
        projectId: string;

        blockChainId: string;
        networkId: string;

        address: string;

        minConfirmations: number;

        subscribed: boolean;
        isProjectActive: boolean;
        isClientActive: boolean;

        createdAt: Date;
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

    export enum EthereumContractCompatibleStandard {
        ERC20 = 'ERC20',
        ERC223 = 'ERC223',
        ERC721 = 'ERC721'
    }

    export interface EthereumContractSubscription extends AddressSubscription {
        compatibleStandard: EthereumContractCompatibleStandard;

        abi: Array<EthereumContractAbiItem>;

        abiEvents: Array<string>;

        subscribedEvents: Array<string>;
        subscribeAllEvents: boolean;

        createdAt: Date;
    }

    export interface EthereumContractAbiItem {
        anonymous?: boolean;
        constant?: boolean;

        inputs: Array<EthereumContractAbiItemNameType>;
        name: string;
        outputs?: Array<EthereumContractAbiItemNameType>;
        type: string;
    }

    export interface EthereumContractAbiItemNameType {
        name: string;
        type: string;
        indexed: boolean;
    }

    export interface EthereumEventLog extends MongoScheme {
        blockChainId: string;
        networkId: string;

        blockHash: string;
        blockHeight: number;
        blockTime: number;

        txHash: string;

        address: string;

        event: string;
        eventHash: string;

        params: Hashtable<any>;

        createdAt: Date;
    }

    export enum WebhookReportItemStatus {
        Created = 'CREATED',
        Failed = 'FAILED',
        Sent = 'SENT'
    }

    export enum WebhookTriggerType {
        Address = 'ADDRESS',
        EthereumContractEvent = 'ETHEREUM_CONTRACT_EVENT'
    }

    export interface WebHookActionItem extends MongoScheme {
        webHookUrl: string;

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

        fails: Array<WebHookFailedReport>;

        status: Scheme.WebhookReportItemStatus;

        createdAt: Date;
    }

    export interface WebHookFailedReport {
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