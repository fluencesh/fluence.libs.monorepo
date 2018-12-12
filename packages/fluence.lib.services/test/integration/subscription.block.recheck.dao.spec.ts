import { random } from 'lodash';
import { MongodbSubscriptionBlockRecheckDao, Scheme, DaoCollectionNames } from '../../src';
import * as config from 'config';
import 'jest-extended';
import {
    clearCollections,
    createEntities,
    getRandomItem,
    generateSubscriptionBlockRecheck
} from '../helpers';
import { Db, MongoClient } from 'mongodb';

describe('Subscription Block Recheck DAO (integration)', () => {
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
        let dao: MongodbSubscriptionBlockRecheckDao;

        let rechecks: Array<Scheme.SubscriptionBlockRecheck>;
        let recheck: Scheme.SubscriptionBlockRecheck;

        beforeAll(async () => {
            dbName = config.get('multivest.mongodb.dbName') + 'SubscriptionBlockRecheckDaoRead';
            db = connection.db(dbName);
            dao = new MongodbSubscriptionBlockRecheckDao(db);

            await clearCollections(db, [ DaoCollectionNames.SubscriptionBlockRecheck ]);

            rechecks = new Array(15);
            await createEntities(dao, generateSubscriptionBlockRecheck, rechecks);
        });

        beforeEach(() => {
            recheck = getRandomItem(rechecks);
        });

        afterAll(async () => {
            if (config.has('tests.dropDbAfterTest') && config.get('tests.dropDbAfterTest')) {
                await db.dropDatabase();
            }
        });

        it('should get by id', async () => {
            const got = await dao.getById(recheck.id);
            expect(got).toEqual(recheck);
        });
    
        it('should get by unique info', async () => {
            const got = await dao.getByUniqueInfo(
                recheck.subscriptionId,
                recheck.transportConnectionId,
                recheck.type,
                recheck.blockHash,
                recheck.blockHeight
            );
            expect(got).toEqual(recheck);
        });
    
        it('should get by block height', async () => {
            const filtered =
                rechecks.filter((r) => r.blockHeight === recheck.blockHeight);
    
            const got = await dao.listByBlockHeight(recheck.blockHeight);
            expect(got).toEqual(filtered);
        });
    
        it('should get by block height and transportConnectionId', async () => {
            const filtered = rechecks.filter((r) =>
                r.blockHeight === recheck.blockHeight
                && r.transportConnectionId === recheck.transportConnectionId
            );
    
            const got = await dao.listByBlockHeightAndTransportConnectionId(
                recheck.blockHeight,
                recheck.transportConnectionId
            );
            expect(got).toEqual(filtered);
        });
    
        it('should get by block height and blockchainId and networkId', async () => {
            const filtered = rechecks.filter((r) =>
                r.blockHeight === recheck.blockHeight
                && r.transportConnectionId === recheck.transportConnectionId
                && r.type === recheck.type
            );
    
            const got = await dao.listByBlockHeightAndTransportConnectionIdAndType(
                recheck.blockHeight,
                recheck.transportConnectionId,
                recheck.type
            );
            expect(got).toEqual(filtered);
        });
    
        it('should get by invokeOnBlockHeight and transportConnectionId and type', async () => {
            const filtered = rechecks.filter((r) =>
                r.invokeOnBlockHeight <= recheck.invokeOnBlockHeight
                && r.transportConnectionId === recheck.transportConnectionId
                && r.type === recheck.type
            );
    
            const got = await dao.listOnBlockByTransportAndType(
                recheck.invokeOnBlockHeight,
                recheck.transportConnectionId,
                recheck.type
            );
            expect(got).toEqual(filtered);
        });
    });

    describe('Create/Update operations', () => {
        let dbName: string;
        let db: Db;
        let dao: MongodbSubscriptionBlockRecheckDao;

        let rechecks: Array<Scheme.SubscriptionBlockRecheck>;
        let recheck: Scheme.SubscriptionBlockRecheck;

        beforeAll(async () => {
            dbName = config.get('multivest.mongodb.dbName') + 'SubscriptionBlockRecheckDaoCreateUpdate';
            db = connection.db(dbName);
            dao = new MongodbSubscriptionBlockRecheckDao(db);

            await clearCollections(db, [ DaoCollectionNames.SubscriptionBlockRecheck ]);

            rechecks = new Array(15);
            await createEntities(dao, generateSubscriptionBlockRecheck, rechecks);
        });

        beforeEach(() => {
            recheck = getRandomItem(rechecks);
        });

        afterAll(async () => {
            if (config.has('tests.dropDbAfterTest') && config.get('tests.dropDbAfterTest')) {
                await db.dropDatabase();
            }
        });

        it('should create new entity', async () => {
            const data = generateSubscriptionBlockRecheck();
            const created = await dao.createBlockRecheck(
                data.subscriptionId,
                data.transportConnectionId,
                data.type,
                data.blockHash,
                data.blockHeight,
                data.invokeOnBlockHeight,
                data.webhookActionItem
            );
            
            expect(created.subscriptionId).toEqual(data.subscriptionId);
            expect(created.transportConnectionId).toEqual(data.transportConnectionId);
            expect(created.type).toEqual(data.type);
            expect(created.blockHash).toEqual(data.blockHash);
            expect(created.blockHeight).toEqual(data.blockHeight);
            expect(created.invokeOnBlockHeight).toEqual(data.invokeOnBlockHeight);
            expect(created.webhookActionItem).toEqual(data.webhookActionItem);

            const got = await dao.getById(created.id);
            expect(got).toBeObject();
        });
    
        it('should increment `invokeOnBlockHeight` by id', async () => {
            await dao.incInvokeOnBlockHeightById(recheck.id);
    
            const got = await dao.getById(recheck.id);
            expect(got.invokeOnBlockHeight).toEqual(recheck.invokeOnBlockHeight + 1);
    
            recheck.invokeOnBlockHeight++;
        });
    
        it('should increment `invokeOnBlockHeight` by id (another one)', async () => {
            const incrementOn = random(2, 10);
            await dao.incInvokeOnBlockHeightById(recheck.id, incrementOn);
    
            const got = await dao.getById(recheck.id);
            expect(got.invokeOnBlockHeight).toEqual(recheck.invokeOnBlockHeight + incrementOn);
    
            recheck.invokeOnBlockHeight += incrementOn;
        });
    
        it('should increment `invokeOnBlockHeight` by ids', async () => {
            await dao.incInvokeOnBlockHeightByIds([ recheck.id ]);
    
            const got = await dao.getById(recheck.id);
            expect(got.invokeOnBlockHeight).toEqual(recheck.invokeOnBlockHeight + 1);
    
            recheck.invokeOnBlockHeight++;
        });
    
        it('should increment `invokeOnBlockHeight` by ids (another one)', async () => {
            const incrementOn = random(2, 10);
            await dao.incInvokeOnBlockHeightByIds([ recheck.id ], incrementOn);
    
            const got = await dao.getById(recheck.id);
            expect(got.invokeOnBlockHeight).toEqual(recheck.invokeOnBlockHeight + incrementOn);
    
            recheck.invokeOnBlockHeight += incrementOn;
        });
    
        it('should set new `invokeOnBlockHeight` by id', async () => {
            const invokeOnBlockHeight = random(500000, 1000000);
            await dao.setInvokeOnBlockHeightById(recheck.id, invokeOnBlockHeight);
    
            const got = await dao.getById(recheck.id);
            expect(got.invokeOnBlockHeight).toEqual(invokeOnBlockHeight);
    
            recheck.invokeOnBlockHeight = invokeOnBlockHeight;
        });
    });

    describe('Delete operations', () => {
        let dbName: string;
        let db: Db;
        let dao: MongodbSubscriptionBlockRecheckDao;

        let rechecks: Array<Scheme.SubscriptionBlockRecheck>;
        let recheck: Scheme.SubscriptionBlockRecheck;

        beforeAll(async () => {
            dbName = config.get('multivest.mongodb.dbName') + 'SubscriptionBlockRecheckDaoDelete';
            db = connection.db(dbName);
            dao = new MongodbSubscriptionBlockRecheckDao(db);

            await clearCollections(db, [ DaoCollectionNames.SubscriptionBlockRecheck ]);

            rechecks = new Array(15);
            await createEntities(dao, generateSubscriptionBlockRecheck, rechecks);
        });

        beforeEach(() => {
            recheck = getRandomItem(rechecks);
        });

        afterAll(async () => {
            if (config.has('tests.dropDbAfterTest') && config.get('tests.dropDbAfterTest')) {
                await db.dropDatabase();
            }
        });

        it('should remove by id', async () => {
            await dao.removeById(recheck.id);

            const got = await dao.getById(recheck.id);
            expect(got).toBeNull();

            rechecks.splice(rechecks.indexOf(recheck), 1);
        });

        it('should remove by ids', async () => {
            await dao.removeByIds([ recheck.id ]);

            const got = await dao.getById(recheck.id);
            expect(got).toBeNull();

            rechecks.splice(rechecks.indexOf(recheck), 1);
        });
    });
});
