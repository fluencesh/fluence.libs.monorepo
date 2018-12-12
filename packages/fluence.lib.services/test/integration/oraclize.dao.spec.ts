import * as config from 'config';
import { sortBy } from 'lodash';
import { Db, MongoClient} from 'mongodb';
import { DaoCollectionNames, Scheme } from '../../src';
import { MongodbOraclizeSubscriptionDao } from '../../src/dao/mongodb/oraclize.subscription.dao';
import { clearCollections, generateOraclize, createEntities, getRandomItem } from '../helpers';
import 'jest-extended';

describe('Oraclize DAO (integration)', () => {
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
        let dao: MongodbOraclizeSubscriptionDao;

        let subscriptions: Array<Scheme.OraclizeSubscription>;
        let subscription: Scheme.OraclizeSubscription;

        beforeAll(async () => {
            dbName = config.get('multivest.mongodb.dbName') + 'OraclizeDaoRead';
            db = connection.db(dbName);
            dao = new MongodbOraclizeSubscriptionDao(db);

            await clearCollections(db, [ DaoCollectionNames.Oraclize ]);

            subscriptions = new Array(15);
            await createEntities(dao, generateOraclize, subscriptions);
        });

        beforeEach(() => {
            subscription = getRandomItem(subscriptions);
        });

        afterAll(async () => {
            if (config.has('tests.dropDbAfterTest') && config.get('tests.dropDbAfterTest')) {
                await db.dropDatabase();
            }
        });

        it('should get oraclize by ID', async () => {
            const got = await dao.getById(subscription.id);
            expect(got).toEqual(subscription);
        });
    
        it('should get oraclize by ID and project ID', async () => {
            const got = await dao.getByIdAndProjectId(subscription.id, subscription.projectId);
            expect(got).toEqual(subscription);
        });
    
        it('should get list of oraclize by event hash', async () => {
            const filtered = subscriptions.filter((s) => s.eventHash === subscription.eventHash);
    
            const got = await dao.listByEventHash(subscription.eventHash);
            expect(sortBy(got, 'id')).toEqual(sortBy(filtered, 'id'));
        });
    
        it('should get list of oraclize by event hash and status', async () => {
            const filtered = subscriptions.filter((s) =>
                s.eventHash === subscription.eventHash
                && s.subscribed === subscription.subscribed
            );
    
            const got = await dao.listByEventHashAndStatus(subscription.eventHash, subscription.subscribed);
            expect(sortBy(got, 'id')).toEqual(sortBy(filtered, 'id'));
        });
    
        it('should get list of oraclize by event hashes', async () => {
            const filtered = subscriptions.filter((s) => s.eventHash === subscription.eventHash);
    
            const got = await dao.listByEventHashes([ subscription.eventHash ]);
            expect(sortBy(got, 'id')).toEqual(sortBy(filtered, 'id'));
        });
    
        it('should get list of oraclize by eventHash and subscribed', async () => {
            const filtered = subscriptions.filter((s) =>
                s.eventHash === subscription.eventHash && s.subscribed === subscription.subscribed
            );
    
            const got = await dao.listByEventHashesAndStatus([ subscription.eventHash ], subscription.subscribed);
            expect(sortBy(got, 'id')).toEqual(sortBy(filtered, 'id'));
        });
    
        it('should get list of oraclize by project id', async () => {
            const filtered = subscriptions.filter((s) => s.projectId === subscription.projectId);
    
            const got = await dao.listByProjectId(subscription.projectId);
            expect(sortBy(got, 'id')).toEqual(sortBy(filtered, 'id'));
        });
    
        it('should get list of oraclize by subscribed', async () => {
            const filtered = subscriptions.filter((s) => s.subscribed === subscription.subscribed);
    
            const got = await dao.listByStatus(subscription.subscribed);
            expect(sortBy(got, 'id')).toEqual(sortBy(filtered, 'id'));
        });
    
        it('should get list of oraclize by subscribed and project id', async () => {
            const filtered = subscriptions.filter((s) =>
                s.subscribed === subscription.subscribed && s.projectId === subscription.projectId
            );
    
            const got = await dao.listByStatusAndProjectId(subscription.subscribed, subscription.projectId);
            expect(sortBy(got, 'id')).toEqual(sortBy(filtered, 'id'));
        });
    });

    describe('Create/Update operations', () => {
        let dbName: string;
        let db: Db;
        let dao: MongodbOraclizeSubscriptionDao;

        let subscriptions: Array<Scheme.OraclizeSubscription>;
        let subscription: Scheme.OraclizeSubscription;

        beforeAll(async () => {
            dbName = config.get('multivest.mongodb.dbName') + 'OraclizeDaoCreateUpdate';
            db = connection.db(dbName);
            dao = new MongodbOraclizeSubscriptionDao(db);

            await clearCollections(db, [ DaoCollectionNames.Oraclize ]);

            subscriptions = new Array(15);
            await createEntities(dao, generateOraclize, subscriptions);
        });

        beforeEach(() => {
            subscription = getRandomItem(subscriptions);
        });

        afterAll(async () => {
            if (config.has('tests.dropDbAfterTest') && config.get('tests.dropDbAfterTest')) {
                await db.dropDatabase();
            }
        });

        it('should create new oraclize', async () => {
            const data = generateOraclize();
    
            const created = await dao.createSubscription(
                data.clientId,
                data.projectId,
                data.transportConnectionId,
                data.minConfirmations,
                data.eventHash,
                data.eventName,
                data.eventInputTypes,
                data.webhookUrl
            );
    
            expect(created.projectId).toEqual(data.projectId);
            expect(created.clientId).toEqual(data.clientId);
            expect(created.transportConnectionId).toEqual(data.transportConnectionId);
            expect(created.minConfirmations).toEqual(data.minConfirmations);
            expect(created.eventHash).toEqual(data.eventHash);
            expect(created.eventName).toEqual(data.eventName);
            expect(created.eventInputTypes).toEqual(data.eventInputTypes);
            expect(created.webhookUrl).toEqual(data.webhookUrl);

            const got = await dao.getById(created.id);

            expect(got).toBeObject();
        });
    
        it('should set new subscribed', async () => {
            const subscribed = !subscription.subscribed;
    
            await dao.setSubscribed(subscription.id, subscribed);
            const got = await dao.getById(subscription.id);
    
            expect(got.subscribed).toEqual(subscribed);

            subscription.subscribed = subscribed;
        });
    });
});
