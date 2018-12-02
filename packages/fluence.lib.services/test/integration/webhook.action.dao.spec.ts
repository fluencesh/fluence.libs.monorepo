import * as config from 'config';
import { MongoClient, Db } from 'mongodb';
import { MongodbWebhookActionDao } from '../../src/dao/mongodb/webhook.action.dao';
import { Scheme } from '../../src/types';
import { random } from 'lodash';
import 'jest-extended';
import { DaoCollectionNames } from '../../src';
import { clearCollections, createEntities, getRandomItem, generateWebhookAction } from '../helpers';

describe('Webhook Action DAO (integration)', () => {
    let mongoUrl: string;
    let connection: MongoClient;

    beforeAll(async () => {
        mongoUrl = config.get<string>('multivest.mongodb.url');
        connection = await MongoClient.connect(mongoUrl);
    });

    afterAll(async () => {
        await connection.close();
    });

    describe('Read operations', () => {
        let dbName: string;
        let db: Db;
        let dao: MongodbWebhookActionDao;

        let webhookActions: Array<Scheme.WebhookActionItem>;
        let webhookAction: Scheme.WebhookActionItem;

        beforeAll(async () => {
            dbName = config.get('multivest.mongodb.dbName') + 'WebhookDaoRead';
            db = connection.db(dbName);
            dao = new MongodbWebhookActionDao(db);

            await clearCollections(db, [ DaoCollectionNames.WebhookAction ]);

            webhookActions = new Array(15);
            await createEntities(dao, generateWebhookAction, webhookActions);
        });

        beforeEach(() => {
            webhookAction = getRandomItem(webhookActions);
        });

        afterAll(async () => {
            if (config.has('tests.dropDbAfterTest') && config.get('tests.dropDbAfterTest')) {
                await db.dropDatabase();
            }
        });

        it('should get by id', async () => {
            const got = await dao.getById(webhookAction.id);
    
            expect(got).toEqual(webhookAction);
        });
    
        it('should get by unique info', async () => {
            const got = await dao.getByUniqueInfo(
                webhookAction.blockHash,
                webhookAction.blockHeight,
                webhookAction.type,
                webhookAction.refId,
                webhookAction.eventId
            );
    
            expect(got).toEqual(webhookAction);
        });
    
        it('should get by client id', async () => {
            const filtered = webhookActions.filter((wa) => wa.clientId === webhookAction.clientId);
    
            const got = await dao.listByClientId(webhookAction.clientId);
    
            expect(got).toEqual(filtered);
        });
    
        it('should get by project id', async () => {
            const filtered = webhookActions.filter((wa) => wa.projectId === webhookAction.projectId);
    
            const got = await dao.listByProjectId(webhookAction.projectId);
    
            expect(got).toEqual(filtered);
        });
    
        it('should get by status', async () => {
            const filtered = webhookActions.filter((wa) => wa.status === webhookAction.status);
    
            const got = await dao.listByStatus(webhookAction.status);
    
            expect(got).toEqual(filtered);
        });
    
        it('should get by status and type', async () => {
            const filtered =
                webhookActions.filter((wa) => wa.status === webhookAction.status && wa.type === webhookAction.type);
    
            const got = await dao.listByStatusAndType(webhookAction.status, webhookAction.type);
    
            expect(got).toEqual(filtered);
        });
    
        it('should get by status and types', async () => {
            const filtered =
                webhookActions.filter((wa) => wa.status === webhookAction.status && wa.type === webhookAction.type);
    
            const got = await dao.listByStatusAndTypes(webhookAction.status, [ webhookAction.type ]);
    
            expect(got).toEqual(filtered);
        });
    });

    describe('Create/Update operations', () => {
        let dbName: string;
        let db: Db;
        let dao: MongodbWebhookActionDao;

        let webhookActions: Array<Scheme.WebhookActionItem>;
        let webhookAction: Scheme.WebhookActionItem;

        beforeAll(async () => {
            dbName = config.get('multivest.mongodb.dbName') + 'WebhookDaoCreateUpdate';
            db = connection.db(dbName);
            dao = new MongodbWebhookActionDao(db);

            await clearCollections(db, [ DaoCollectionNames.WebhookAction ]);

            webhookActions = new Array(15);
            await createEntities(dao, generateWebhookAction, webhookActions);
        });

        beforeEach(() => {
            webhookAction = getRandomItem(webhookActions);
        });

        afterAll(async () => {
            if (config.has('tests.dropDbAfterTest') && config.get('tests.dropDbAfterTest')) {
                await db.dropDatabase();
            }
        });

        it('should create ethereum event log', async () => {
            const data = generateWebhookAction();
    
            const created = await dao.createAction(
                data.clientId,
                data.projectId,
    
                data.blockchainId,
                data.networkId,
    
                data.blockHash,
                data.blockHeight,
                data.blockTime,
    
                data.minConfirmations,
                data.confirmations,
    
                data.txHash,
    
                data.address,
    
                data.type,
                data.refId,
    
                data.eventId,
                data.params
            );

            expect(created.clientId).toEqual(data.clientId);
            expect(created.projectId).toEqual(data.projectId);
            expect(created.blockchainId).toEqual(data.blockchainId);
            expect(created.networkId).toEqual(data.networkId);
            expect(created.blockHash).toEqual(data.blockHash);
            expect(created.blockHeight).toEqual(data.blockHeight);
            expect(created.blockTime).toEqual(data.blockTime);
            expect(created.minConfirmations).toEqual(data.minConfirmations);
            expect(created.confirmations).toEqual(data.confirmations);
            expect(created.txHash).toEqual(data.txHash);
            expect(created.address).toEqual(data.address);
            expect(created.type).toEqual(data.type);
            expect(created.refId).toEqual(data.refId);
            expect(created.eventId).toEqual(data.eventId);
            expect(created.params).toEqual(data.params);
    
            const got = await await dao.getById(created.id);
            expect(got).toBeObject();
        });
    
        it('should set new confirmation and status', async () => {
            const confirmations = random(1, 10);
            const status = webhookAction.status === Scheme.WebhookReportItemStatus.Created
                ? Scheme.WebhookReportItemStatus.Sent
                : Scheme.WebhookReportItemStatus.Created;
    
            await dao.setConfirmationsAndStatus(
                webhookAction.id,
                confirmations,
                status
            );
    
            const got = await dao.getById(webhookAction.id);
    
            expect(got.confirmations).toEqual(confirmations);
            expect(got.status).toEqual(status);

            webhookAction.status = status;
            webhookAction.confirmations = confirmations;
        });
    
        it('should set new status', async () => {
            const status = webhookAction.status === Scheme.WebhookReportItemStatus.Created
                ? Scheme.WebhookReportItemStatus.Sent
                : Scheme.WebhookReportItemStatus.Created;
    
            await dao.setStatus(
                webhookAction.id,
                status
            );
    
            const got = await dao.getById(webhookAction.id);
    
            expect(got.status).toEqual(status);

            webhookAction.status = status;
        });
    });
});
