import { random } from 'lodash';
import {
    MongodbSubscriptionBlockRecheckDao,
    Scheme,
    DaoCollectionNames,
    SubscriptionBlockRecheckService
} from '../../src';
import * as config from 'config';
import 'jest-extended';
import {
    clearCollections,
    createEntities,
    getRandomItem,
    generateSubscriptionBlockRecheck,
    initSubscriptionBlockRecheckService
} from '../helpers';
import { Db, MongoClient } from 'mongodb';

describe('Subscription Block Recheck Service (integration)', () => {
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
        let service: SubscriptionBlockRecheckService;

        let rechecks: Array<Scheme.SubscriptionBlockRecheck>;
        let recheck: Scheme.SubscriptionBlockRecheck;

        beforeAll(async () => {
            dbName = config.get('multivest.mongodb.dbName') + 'SubscriptionBlockRecheckServiceRead';
            db = connection.db(dbName);
            service = initSubscriptionBlockRecheckService(db);

            await clearCollections(db, [ DaoCollectionNames.SubscriptionBlockRecheck ]);

            rechecks = new Array(15);
            await createEntities(
                new MongodbSubscriptionBlockRecheckDao(db),
                generateSubscriptionBlockRecheck,
                rechecks
            );
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
            const got = await service.getById(recheck.id);
            expect(got).toEqual(recheck);
        });
    
        it('should get by unique info', async () => {
            const got = await service.getByUniqueInfo(
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
    
            const got = await service.listByBlockHeight(recheck.blockHeight);
            expect(got).toEqual(filtered);
        });
    
        it('should get by block height and transportConnectionId', async () => {
            const filtered = rechecks.filter((r) =>
                r.blockHeight === recheck.blockHeight
                && r.transportConnectionId === recheck.transportConnectionId
            );
    
            const got = await service.listByBlockHeightAndTransportConnectionId(
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
    
            const got = await service.listByBlockHeightAndTransportConnectionIdAndType(
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
    
            const got = await service.listOnBlockByTransportAndType(
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
        let service: SubscriptionBlockRecheckService;

        let rechecks: Array<Scheme.SubscriptionBlockRecheck>;
        let recheck: Scheme.SubscriptionBlockRecheck;

        beforeAll(async () => {
            dbName = config.get('multivest.mongodb.dbName') + 'SubscriptionBlockRecheckServiceRead';
            db = connection.db(dbName);
            service = initSubscriptionBlockRecheckService(db);

            await clearCollections(db, [ DaoCollectionNames.SubscriptionBlockRecheck ]);

            rechecks = new Array(15);
            await createEntities(
                new MongodbSubscriptionBlockRecheckDao(db),
                generateSubscriptionBlockRecheck,
                rechecks
            );
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
            const created = await service.createBlockRecheck(
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

            const got = await service.getById(created.id);
            expect(got).toBeObject();
        });
    
        it('should increment `invokeOnBlockHeight` by id', async () => {
            await service.incInvokeOnBlockHeightById(recheck.id);
    
            const got = await service.getById(recheck.id);
            expect(got.invokeOnBlockHeight).toEqual(recheck.invokeOnBlockHeight + 1);
    
            recheck.invokeOnBlockHeight++;
        });
    
        it('should increment `invokeOnBlockHeight` by id (another one)', async () => {
            const incrementOn = random(2, 10);
            await service.incInvokeOnBlockHeightById(recheck.id, incrementOn);
    
            const got = await service.getById(recheck.id);
            expect(got.invokeOnBlockHeight).toEqual(recheck.invokeOnBlockHeight + incrementOn);
    
            recheck.invokeOnBlockHeight += incrementOn;
        });
    
        it('should increment `invokeOnBlockHeight` by ids', async () => {
            await service.incInvokeOnBlockHeightByIds([ recheck.id ]);
    
            const got = await service.getById(recheck.id);
            expect(got.invokeOnBlockHeight).toEqual(recheck.invokeOnBlockHeight + 1);
    
            recheck.invokeOnBlockHeight++;
        });
    
        it('should increment `invokeOnBlockHeight` by ids (another one)', async () => {
            const incrementOn = random(2, 10);
            await service.incInvokeOnBlockHeightByIds([ recheck.id ], incrementOn);
    
            const got = await service.getById(recheck.id);
            expect(got.invokeOnBlockHeight).toEqual(recheck.invokeOnBlockHeight + incrementOn);
    
            recheck.invokeOnBlockHeight += incrementOn;
        });
    
        it('should set new `invokeOnBlockHeight` by id', async () => {
            const invokeOnBlockHeight = random(500000, 1000000);
            await service.setInvokeOnBlockHeightById(recheck.id, invokeOnBlockHeight);
    
            const got = await service.getById(recheck.id);
            expect(got.invokeOnBlockHeight).toEqual(invokeOnBlockHeight);
    
            recheck.invokeOnBlockHeight = invokeOnBlockHeight;
        });
    });

    describe('Delete operations', () => {
        let dbName: string;
        let db: Db;
        let service: SubscriptionBlockRecheckService;

        let rechecks: Array<Scheme.SubscriptionBlockRecheck>;
        let recheck: Scheme.SubscriptionBlockRecheck;

        beforeAll(async () => {
            dbName = config.get('multivest.mongodb.dbName') + 'SubscriptionBlockRecheckServiceRead';
            db = connection.db(dbName);
            service = initSubscriptionBlockRecheckService(db);

            await clearCollections(db, [ DaoCollectionNames.SubscriptionBlockRecheck ]);

            rechecks = new Array(15);
            await createEntities(
                new MongodbSubscriptionBlockRecheckDao(db),
                generateSubscriptionBlockRecheck,
                rechecks
            );
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
            await service.removeById(recheck.id);

            const got = await service.getById(recheck.id);
            expect(got).toBeNull();

            rechecks.splice(rechecks.indexOf(recheck), 1);
        });

        it('should remove by ids', async () => {
            await service.removeByIds([ recheck.id ]);

            const got = await service.getById(recheck.id);
            expect(got).toBeNull();

            rechecks.splice(rechecks.indexOf(recheck), 1);
        });
    });
});
