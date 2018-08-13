import { Transaction } from '@fluencesh/multivest.core';
import BigNumber from 'bignumber.js';
import { createHash } from 'crypto';
import { random } from 'lodash';
import { generate } from 'randomstring';
import { v1 as generateId } from 'uuid';
import { RandomStringPresets } from '../src/constants';
import { Scheme } from './../src/types';

export function randomAddressSubscription(): Scheme.AddressSubscription {
    return {
        clientId: generateId(),
        projectId: generateId(),
        blockChainId: generateId(),
        networkId: generateId(),
        address: generateId(),
        minConfirmations: random(10, 100),
        subscribed: random(0, 1, true) > .5,
        isProjectActive: random(0, 1, true) > .5,
        isClientActive: random(0, 1, true) > .5,
        createdAt: new Date(),
    } as Scheme.AddressSubscription;
}

export function randomTransactionSubscription(): Scheme.TransactionHashSubscription {
    return {
        blockChainId: generateId(),
        clientId: generateId(),
        hash: `0x${generateId()}`,
        isClientActive: true,
        isProjectActive: true,
        minConfirmations: 0,
        networkId: generateId(),
        projectId: generateId(),
        subscribed: true,
    } as Scheme.TransactionHashSubscription;
}

export function randomClient(): Scheme.Client {
    return {
        ethereumAddress: generateId(),
        status: random(0, 1, true) > .5 ? Scheme.ClientStatus.Active : Scheme.ClientStatus.Inactive,
        createdAt: new Date(),
        isAdmin: false
    } as Scheme.Client;
}

export function randomProject(): Scheme.Project {
    const salt = generate({ length: 64, charset: '1234567890abcdef' });
    const token = generate({ length: 64, charset: '1234567890abcdef' });
    const saltyToken = createHash('sha256')
        .update(token)
        .update(salt)
        .digest('hex');

    return {
        clientId: generateId(),

        name: generateId(),
        status: random(0, 1, true) > .5 ? Scheme.ProjectStatus.Active : Scheme.ProjectStatus.Inactive,

        webhookUrl: `https://www.${generateId()}.eu`,
        failedRetryCount: random(0, 5),

        sharedSecret: `secret_${generateId()}`,

        txMinConfirmations: random(0, 10),
        
        token,
        salt,
        saltyToken,

        createdAt: new Date(),
        
        removedAt: null,
        isRemoved: false,
    } as Scheme.Project;
}

export function randomWebhookAction(): Scheme.WebhookActionItem {
    const failedCount = random(0, 5);

    const randomNumber = random(0, 1, true);
    let status;
    if (failedCount) {
        status = Scheme.WebhookReportItemStatus.Failed;
    } else if (randomNumber < .5) {
        status = Scheme.WebhookReportItemStatus.Created;
    } else {
        status = Scheme.WebhookReportItemStatus.Sent;
    }

    return {
        webhookUrl: `https://www.${generateId()}.eu`,

        clientId: generateId(),
        projectId: generateId(),

        blockChainId: generateId(),
        networkId: generateId(),

        blockHash: generateId(),
        blockHeight: random(1, 1000),
        blockTime: random(500, 2000),

        minConfirmations: random(10, 100),
        confirmations: random(1, 10),

        txHash: generateId(),

        address: generateId(),

        type: random(0, 1, true) > .5
            ? Scheme.WebhookTriggerType.Address
            : Scheme.WebhookTriggerType.EthereumContractEvent,
        refId: generateId(),

        eventId: generateId(),
        params: { [generateId()]: generateId() },

        failedCount,
        lastFailedAt: failedCount ? new Date() : null,

        fails: failedCount ? [{}] : [],

        status,

        createdAt: new Date()
    } as Scheme.WebhookActionItem;
}

export function randomTransportConnection() {
    const isFailing = random(0, 1, true) > .5;

    const status = random(0, 1, true) > .5
        ? Scheme.TransportConnectionStatus.Enabled
        : Scheme.TransportConnectionStatus.Disabled;

    return {
        blockchainId: generateId(),
        networkId: generateId(),
        providerId: generateId(),

        priority: random(0, 100),

        settings: {},

        status,

        isFailing,
        lastFailedAt: isFailing ? new Date() : null,
        failedCount: isFailing ? random(0, 10) : 0,
        
        isPrivate: false,

        createdAt: new Date(),
    } as Scheme.TransportConnection;
}

export function randomEthereumContractSubscription(): Scheme.EthereumContractSubscription {
    const randomNumber = random(0, 1, true);
    let compatibleStandard;
    if (randomNumber < .33) {
        compatibleStandard = Scheme.EthereumContractCompatibleStandard.ERC20;
    } else if (randomNumber >= .33 && randomNumber < .67) {
        compatibleStandard = Scheme.EthereumContractCompatibleStandard.ERC223;
    } else {
        compatibleStandard = Scheme.EthereumContractCompatibleStandard.ERC721;
    }

    const addressSubscription = randomAddressSubscription();
    return Object.assign({
        compatibleStandard,
        abi: [],
        abiEvents: [],
        subscribedEvents: [],
        subscribeAllEvents: true,
    }, addressSubscription) as Scheme.EthereumContractSubscription;
}

export function randomEthereumEventLog(): Scheme.EthereumEventLog {
    return {
        id: generateId(),

        blockChainId: generateId(),
        networkId: generateId(),

        blockHash: generateId(),
        blockHeight: random(1, 1000),
        blockTime: random(500, 2000),

        txHash: generateId(),

        address: generateId(),

        event: 'data',
        eventHash: generateId(),

        params: { [generateId()]: generateId() },

        createdAt: new Date()
    } as Scheme.EthereumEventLog;
}

export function randomContract() {
    return {
        address: generateId(),
        abi: getRandomAbi(),
        projectId: generateId(),
        isFabric: !!random(0, 1),
        isPublic: !!random(0, 1),
    } as Scheme.ContractScheme;
}

// tslint:disable-next-line:no-var-requires
const abi: Array<any> = require('./data/abi.json');
const methodsCount = abi.length;

export function getRandomAbi() {
    return [ abi[random(0, methodsCount - 1)] ];
}

export function randomContractPublicRequest(
    clientId: string = generateId(),
    contractId: string = generateId(),
    adminId: string = null,
    adminResolution: string = null,
    adminResolutionStatus: Scheme.AdminResolutionStatus = null
): Scheme.ContractPublicRequest {
    return {
        clientId,
        contractId,
        description: 'lorem ipsum',
        adminId,
        adminResolution,
        adminResolutionStatus,
    } as Scheme.ContractPublicRequest;
}

export function randomScheduledTx() {
    return {
        id: generateId(),
        cronExpression: '* * * * * * *',
        tx: randomTransactionScheme(),
        projectId: generateId(),
        privateKey: generate(RandomStringPresets.Hash256)
    } as Scheme.ScheduledTx;
}

export function randomTransactionScheme(): Transaction {
    return {
        hash: `0x${generate(RandomStringPresets.Hash256)}`,
        blockHash: `0x${generate(RandomStringPresets.Hash256)}`,
        blockHeight: random(9999, 99999),
        blockTime: random(10, 100),
        fee: new BigNumber(random(1, 10)) as any,
        from: [ { address: `0x${generate(RandomStringPresets.Hash256)}` } ],
        to: [{
            address: `0x${generate(RandomStringPresets.Hash256)}`,
            amount: new BigNumber(random(1, 10)) as any
        }]
    } as Transaction;
}

export function randomSession(): Scheme.Session {
    const expiredAt = new Date();
    expiredAt.setDate(expiredAt.getDate() + 7);

    return {
        clientId: generateId(),
        projectId: generateId(),
        createdAt: new Date(),
        expiredAt,
        loggedOutAt: null,
    } as Scheme.Session;
}

export function randomProjectBlockchainSetup(projectId?: string, privateTransportConnectionId?: string) {
    return {
        blockchainId: 'blockchainId',
        projectId: projectId || generateId(),
        privateTransportConnectionId: privateTransportConnectionId || generateId(),
        status: Scheme.ProjectBlockchainSetupStatus.Enabled
    } as Scheme.ProjectBlockchainSetup;
}
