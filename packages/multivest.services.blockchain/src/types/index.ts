import * as Blockchain from '@applicature-private/multivest.core';
import { Hashtable } from '@applicature-private/multivest.core';
import { MongoScheme } from '@applicature-private/multivest.mongodb';

// tslint:disable-next-line:no-namespace
export namespace Scheme {

    export enum ClientStatus {
        Active = 'ACTIVE',
        Inactive = 'INACTIVE'
    }

    export interface Client extends MongoScheme {
        ethereumAddress: string;
        status: ClientStatus;
        isAdmin: boolean;
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
        isRemoved: boolean;

        webhookUrl: string;
        failedRetryCount: number;

        txMinConfirmations: number;

        token?: string;
        salt?: string;
        saltyToken?: string;

        sharedSecret: string;

        createdAt: Date;
        removedAt: Date;
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
        Transaction = 'TRANSACTION',
        ScheduledTransaction = 'SCHEDULED_TRANSACTION',
        OraclizeSubscription = 'ORACLIZE_SUBSCRIPTION'
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

        isPrivate: boolean;

        isFailing: boolean;
        lastFailedAt: Date;
        failedCount: number;

        createdAt: Date;
    }

    export interface ContractScheme extends MongoScheme {
        address: string;
        abi: Array<EthereumContractAbiItem>;
        projectId: string;
        isFabric: boolean;
        isPublic: boolean;
    }

    export enum EthereumContractCompatibleStandard {
        ERC20 = 'ERC20',
        ERC223 = 'ERC223',
        ERC721 = 'ERC721'
    }

    export interface EthereumContractSubscription extends Scheme.AddressSubscription {
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

    export enum AdminResolutionStatus {
        APPROVE = 'APPROVE',
        DISAPPROVE = 'DISAPPROVE',
    }

    export interface ContractPublicRequest extends MongoScheme {
        clientId: string;
        contractId: string;
        description: string;
        adminId: string;
        adminResolution: string;
        adminResolutionStatus: AdminResolutionStatus;
    }

    export interface ScheduledTx extends MongoScheme {
        cronExpression: string;
        tx: Blockchain.Transaction;
        projectId: string;
        privateKey: string;
    }

    export enum ScheduledTxExecutionStatus {
        SENT = 'SENT',
        FAILED = 'FAILED'
    }

    export interface WebhookCallResult {
        request: WebhookCallRequest;
        response: WebhookCallResponse;
        error: any;
    }
    
    export interface WebhookCallRequest {
        method: string;
        headers: Hashtable<string>;
        data: Hashtable<any>;
    }
    
    export interface WebhookCallResponse {
        body: string;
        headers: Hashtable<string>;
        statusCode: number;
        statusMessage: string;
    }

    export interface Session extends MongoScheme {
        clientId: string;
        projectId?: string;

        createdAt: Date;
        expiredAt: Date;
        loggedOutAt: Date;
    }

    export enum ProjectBlockchainSetupStatus {
        Enabled = 'ENABLED',
        Disabled = 'DISABLED',
    }

    export interface ProjectBlockchainSetup extends MongoScheme {
        projectId: string;
        blockchainId: string;
        privateTransportConnectionId?: string;
        status: ProjectBlockchainSetupStatus;
    }
}
