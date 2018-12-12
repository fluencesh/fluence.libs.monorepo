import * as config from 'config';
import { Db, MongoClient } from 'mongodb';
import { MongodbTransactionHashSubscriptionDao } from '../../src/dao/mongodb/transaction.hash.subscription.dao';
import { Scheme } from '../../src/types';
import { clearCollections, generateTransactionSubscription, createEntities, getRandomItem } from '../helpers';
import { DaoCollectionNames } from '../../src';
import 'jest-extended';

describe('Transaction Hash Subscription DAO (integration)', () => {
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
        let dao: MongodbTransactionHashSubscriptionDao;

        let subscriptions: Array<Scheme.TransactionHashSubscription>;
        let subscription: Scheme.TransactionHashSubscription;
        let activeSubscription: Scheme.TransactionHashSubscription;

        beforeAll(async () => {
            dbName = config.get('multivest.mongodb.dbName') + 'TransactionHashSubscriptionDaoRead';
            db = connection.db(dbName);
            dao = new MongodbTransactionHashSubscriptionDao(db);

            await clearCollections(db, [ DaoCollectionNames.TransactionHashSubscription ]);

            subscriptions = new Array(15);
            await createEntities(dao, generateTransactionSubscription, subscriptions);
        });

        beforeEach(() => {
            subscription = getRandomItem(subscriptions);
            activeSubscription = getRandomItem(
                subscriptions,
                (s) => s.subscribed && s.isClientActive && s.isProjectActive
            );
        });

        afterAll(async () => {
            if (config.has('tests.dropDbAfterTest') && config.get('tests.dropDbAfterTest')) {
                await db.dropDatabase();
            }
        });

        it('should get by id', async () => {
            const got = await dao.getById(subscription.id);
            expect(got).toEqual(subscription);
        });
    
        it('should get by id (active only)', async () => {
            if (!activeSubscription) {
                return;
            }
    
            const got = await dao.getByIdActiveOnly(activeSubscription.id);
    
            expect(got).toEqual(activeSubscription);
        });
    
        it('should get by client id', async () => {
            const filtered = subscriptions.filter((as) => as.clientId === subscription.clientId);
            const got = await dao.listByClientId(subscription.clientId);
            expect(got).toEqual(filtered);
        });
    
        it('should get by client id (active only)', async () => {
            if (!activeSubscription) {
                return;
            }

            const filtered = subscriptions
                .filter((s) =>
                    s.subscribed
                    && s.isClientActive
                    && s.isProjectActive
                    && s.clientId === activeSubscription.clientId
                );
    
            const got = await dao.listByClientIdActiveOnly(activeSubscription.clientId);
    
            expect(got).toEqual(filtered);
        });
    
        it('should get by project id', async () => {
            const filtered = subscriptions.filter((as) => as.projectId === subscription.projectId);
            const got = await dao.listByProjectId(subscription.projectId);
            expect(got).toEqual(filtered);
        });
    
        it('should get by project id (active only)', async () => {
            if (!activeSubscription) {
                return;
            }

            const filtered = subscriptions
                .filter((s) =>
                    s.subscribed
                    && s.isClientActive
                    && s.isProjectActive
                    && s.projectId === activeSubscription.projectId
                );
    
            const got = await dao.listByProjectIdActiveOnly(activeSubscription.projectId);
    
            expect(got).toEqual(filtered);
        });
    
        it('should get by id & project id & client id', async () => {
            const filtered = subscriptions.filter((s) =>
                s.hash === subscription.hash
                && s.clientId === subscription.clientId
                && s.projectId === subscription.projectId
            );

            const got = await dao.listBySubscribedHash(
                subscription.hash,
                subscription.clientId,
                subscription.projectId
            );
    
            expect(got).toEqual(filtered);
        });
    
        it('should get by id & project id & client id (active only)', async () => {
            if (!activeSubscription) {
                return;
            }

            const filtered = subscriptions
                .filter((s) =>
                    s.subscribed
                    && s.isClientActive
                    && s.isProjectActive
                    && s.projectId === activeSubscription.projectId
                    && s.clientId === activeSubscription.clientId
                    && s.hash === activeSubscription.hash
                );
    
            const got = await dao.listBySubscribedHashActiveOnly(
                activeSubscription.hash,
                activeSubscription.clientId,
                activeSubscription.projectId
            );
    
            expect(got).toEqual(filtered);
        });
    });

    describe('Create/Update operations', () => {
        let dbName: string;
        let db: Db;
        let dao: MongodbTransactionHashSubscriptionDao;

        let subscriptions: Array<Scheme.TransactionHashSubscription>;
        let subscription: Scheme.TransactionHashSubscription;
        let activeSubscription: Scheme.TransactionHashSubscription;

        beforeAll(async () => {
            dbName = config.get('multivest.mongodb.dbName') + 'TransactionHashSubscriptionDaoCreateUpdate';
            db = connection.db(dbName);
            dao = new MongodbTransactionHashSubscriptionDao(db);

            await clearCollections(db, [ DaoCollectionNames.TransactionHashSubscription ]);

            subscriptions = new Array(15);
            await createEntities(dao, generateTransactionSubscription, subscriptions);
        });

        beforeEach(() => {
            subscription = getRandomItem(subscriptions);
            activeSubscription = getRandomItem(
                subscriptions,
                (s) => s.subscribed && s.isClientActive && s.isProjectActive
            );
        });

        afterAll(async () => {
            if (config.has('tests.dropDbAfterTest') && config.get('tests.dropDbAfterTest')) {
                await db.dropDatabase();
            }
        });

        it('should set new subscriber status', async () => {
            const subscribed = !subscription.subscribed;
            await dao.setSubscribed(subscription.id, subscribed);
            const got = await dao.getById(subscription.id);

            expect(got.subscribed).toEqual(subscribed);

            subscription.subscribed = subscribed;
        });
    
        it('should set new is client active status', async () => {
            const isClientActive = !subscription.isClientActive;
            await dao.setClientActive(subscription.clientId, isClientActive);
            const got = await dao.listByClientId(subscription.clientId);

            const filtered = subscriptions.filter((s) => s.clientId === subscription.clientId);

            expect(got).toHaveLength(filtered.length);
            expect(got.map((item) => item.id)).toIncludeAllMembers(filtered.map((item) => item.id));
            expect(got).toSatisfyAll((item) => item.isClientActive === isClientActive);
    
            filtered.forEach((s) => s.isClientActive = isClientActive);
        });
    
        it('should set new is project active status', async () => {
            const isProjectActive = !subscription.isProjectActive;
            await dao.setProjectActive(subscription.projectId, isProjectActive);
            const got = await dao.listByProjectId(subscription.projectId);
    
            const filtered = subscriptions.filter((s) => s.projectId === subscription.projectId);

            expect(got).toHaveLength(filtered.length);
            expect(got.map((item) => item.id)).toIncludeAllMembers(filtered.map((item) => item.id));
            expect(got).toSatisfyAll((item) => item.isProjectActive === isProjectActive);
            
            filtered.forEach((s) => s.isProjectActive = isProjectActive);
        });
    
        it('should create subscription', async () => {
            const data = generateTransactionSubscription();
            const created = await dao.createSubscription(
                data.clientId,
                data.projectId,
                data.transportConnectionId,
                data.hash,
                data.minConfirmations
            );

            expect(created.clientId).toEqual(data.clientId);
            expect(created.projectId).toEqual(data.projectId);
            expect(created.transportConnectionId).toEqual(data.transportConnectionId);
            expect(created.hash).toEqual(data.hash);
            expect(created.minConfirmations).toEqual(data.minConfirmations);
    
            const got = await dao.getById(created.id);
            expect(got).toBeObject();
        });
    });
});
