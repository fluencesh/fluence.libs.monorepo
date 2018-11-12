import { MongoDBDao } from '@applicature-private/core.mongodb';
import BigNumber from 'bignumber.js';
import * as config from 'config';
import { createHash } from 'crypto';
import * as faker from 'faker';
import { random, sample } from 'lodash';
import { Db, MongoClient } from 'mongodb';
import { generate } from 'randomstring';
import { v1 as generateId } from 'uuid';
import { RandomStringPresets } from '../src/constants';
import { Scheme } from './../src/types';
import { Constructable, Dao } from '@applicature-private/core.plugin-manager';
import TransactionStatus = Scheme.TransactionStatus;

export function randomAddressSubscription(): Scheme.AddressSubscription {
    return {
        clientId: generateId(),
        projectId: generateId(),
        transportConnectionId: generateId(),
        address: generateId(),
        minConfirmations: random(10, 100),
        subscribed: true,
        isProjectActive: true,
        isClientActive: true,
        createdAt: new Date(),
    } as Scheme.AddressSubscription;
}

export function randomTransactionSubscription(): Scheme.TransactionHashSubscription {
    return {
        clientId: generateId(),
        hash: `0x${generateId()}`,
        isClientActive: true,
        isProjectActive: true,
        minConfirmations: 0,
        transportConnectionId: generateId(),
        projectId: generateId(),
        subscribed: true,
    } as Scheme.TransactionHashSubscription;
}

export function randomClient(): Scheme.Client {
    return {
        email: faker.internet.email(),
        passwordHash: createHash('sha1').update(faker.internet.password()).digest('hex'),
        status: Scheme.ClientStatus.Active,
        createdAt: new Date(),
        isAdmin: false,
        isVerified: true
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

        blockchainId: generateId(),
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

        cronExpression: '* * * * * * *'
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
        blockchainId: generateId(),
        networkId: generateId(),
        privateKey: generate(RandomStringPresets.Hash256),
        relatedJobId: generateId(),
        transportConnectionId: generateId(),
    } as Scheme.ScheduledTx;
}

export function randomTransactionScheme(): Scheme.BlockchainTransaction {
    return {
        id: '123',
        ref: '123',
        uniqId: '123',
        blockChainId: '1',
        networkId: '1',
        status: TransactionStatus.Created,
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
    } as Scheme.BlockchainTransaction;
}

export function randomSession(type?: Scheme.SessionType): Scheme.Session {
    type = type || random(0, 1) ? Scheme.SessionType.ProjectApiKey : Scheme.SessionType.UserSession;

    const expiredAt = type === Scheme.SessionType.UserSession ? new Date() : null;
    if (expiredAt) {
        expiredAt.setDate(expiredAt.getDate() + 7);
    }

    return {
        clientId: generateId(),
        projectId: generateId(),
        createdAt: new Date(),
        expiredAt,
        loggedOutAt: null,
        type,
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

export function randomOraclize(projectId: string = generateId(), ) {
    return {
        clientId: generateId(),
        projectId,
        transportConnectionId: generateId(),
        minConfirmations: random(10, 100),
        subscribed: true,
        isProjectActive: true,
        isClientActive: true,
        createdAt: new Date(),

        eventHash: `0x${generateId()}`,
        eventName: generateId(),
        eventInputTypes: [],
        webhookUrl: `https://www.${generateId()}.com.uk`,
    } as Scheme.OraclizeSubscription;
}

export function randomSubscriptionBlockChecker() {
    const typesKeys = Object.keys(Scheme.SubscriptionBlockRecheckType);
    const blockHeight = random(500000, 1000000);

    return {
        id: generateId(),
        subscriptionId: generateId(),
        transportConnectionId: generateId(),
        type: Scheme.SubscriptionBlockRecheckType[(typesKeys[random(0, typesKeys.length - 1)] as any)],
        blockHash: generateId(),
        blockHeight,
        invokeOnBlockHeight: blockHeight + 10,
        webhookActionItem: randomWebhookAction()
    } as Scheme.SubscriptionBlockRecheck;
}

export function generateRandomPrometheusMetric(): Scheme.PrometheusMetric {
    return {
        id: generateId(),
        name: generate(),
        value: random(0, 1000)
    };
}

let db: Db;
export async function createDao<T extends MongoDBDao<any>>(daoConstructor: Constructable<T>): Promise<T> {
    if (!db) {
        const connection = await MongoClient.connect(config.get('multivest.mongodb.url'), {});
        db = connection.db(config.get('multivest.mongodb.dbName'));
    }

    const dao = new daoConstructor(db);
    return dao;
}

export async function clearDb(collections: Array<string>) {
    if (!db) {
        const connection = await MongoClient.connect(config.get('multivest.mongodb.url'), {});
        db = connection.db(config.get('multivest.mongodb.dbName'));
    }

    await Promise.all(
        collections.map((collection) => db.collection(collection).remove({}))
    );
}

export async function createEntities(
    dao: Dao<any>,
    entityGenerator: () => object,
    target: Array<any>
) {
    await dao.remove({});

    for (let i = 0; i < target.length; i++) {
        const data = entityGenerator();
        target[i] = await dao.create(data);
    }
}

export function getRandomItem<T>(items: Array<T>): T {
    return items[random(0, items.length - 1)];
}

export function randomJob(): Scheme.Job {
    const job: Scheme.Job = {
        id: faker.lorem.word(),
        params: {
            processedBlockHeight: faker.random.number({
                min: 100000,
                max: 1000000,
            })
        },
    };
    return job;
}

export const randomTransactionRef = (): Scheme.BlockchainTransaction => {
    return {
        blockHash: `0x${generateId()}`,
        blockHeight: Math.floor(Math.random() * 100000000),
        blockTime: faker.date.past().getTime(),
        fee: new BigNumber(String(Math.random() / 1000)) as any,
        from: [
            {
                address: `0x${generateId()}`,
            }
        ],
        hash: `0x${generateId()}`,
        to: [
            {
                address: `0x${generateId()}`,
                amount: new BigNumber(String(Math.random())) as any,
            }
        ]
    };
};

const transactionStatuses = [
    Scheme.TransactionStatus.Created,
    Scheme.TransactionStatus.Mined,
    Scheme.TransactionStatus.Sent,
];

export const randomTransaction = (): Scheme.Transaction => {
    return {
        blockChainId: 'ETHEREUM',
        networkId: 'homestead',
        id: generateId(),
        uniqId: `ETHEREUM-${generateId()}`,
        ref: randomTransactionRef(),
        status: sample(transactionStatuses)
    };
};
