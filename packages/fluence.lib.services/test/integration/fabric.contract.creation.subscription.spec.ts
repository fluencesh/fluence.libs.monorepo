import * as config from 'config';
import { MongodbFabricContractCreationSubscriptionDao } from '../../src';
import { Scheme } from '../../src/types';
import {
    getRandomItem,
    createEntities,
    clearCollections,
    generateFabricContractCreationSubscription
} from '../helpers';
import { DaoCollectionNames } from '../../src';
import { MongoClient, Db } from 'mongodb';
import 'jest-extended';

describe('Fabric Contract Creation Subscription DAO (integration)', () => {
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
        let dao: MongodbFabricContractCreationSubscriptionDao;

        let subscriptions: Array<Scheme.FabricContractCreationSubscription>;
        let subscription: Scheme.FabricContractCreationSubscription;
        let activeSubscription: Scheme.FabricContractCreationSubscription;

        beforeAll(async () => {
            dbName = config.get('multivest.mongodb.dbName') + 'FCCSDaoRead';
            db = connection.db(dbName);
            dao = new MongodbFabricContractCreationSubscriptionDao(db);

            await clearCollections(db, [ DaoCollectionNames.FabricContractCreation ]);

            subscriptions = new Array(15);
            await createEntities(dao, generateFabricContractCreationSubscription, subscriptions);
        });

        beforeEach(() => {
            subscription = getRandomItem(subscriptions);
            activeSubscription = getRandomItem(
                subscriptions,
                (item) => item.subscribed && item.isClientActive && item.isProjectActive
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
            const filtered = subscriptions
                .filter((item) =>
                    item.subscribed
                    && item.isClientActive
                    && item.isProjectActive
                    && item.clientId === activeSubscription.clientId
                );

            if (filtered.length === 0) {
                return;
            }

            const got = await dao.listByClientIdActiveOnly(filtered[0].clientId);

            expect(got).toEqual(filtered);
        });

        it('should get by project id', async () => {
            const filtered = subscriptions.filter((as) => as.projectId === subscription.projectId);
            const got = await dao.listByProjectId(subscription.projectId);
            expect(got).toEqual(filtered);
        });

        it('should get by project id (active only)', async () => {
            const filtered = subscriptions
                .filter((item) =>
                    item.subscribed
                    && item.isClientActive
                    && item.isProjectActive
                    && item.projectId === activeSubscription.projectId
                );

            if (filtered.length === 0) {
                return;
            }

            const got = await dao.listByProjectIdActiveOnly(filtered[0].projectId);

            expect(got).toEqual(filtered);
        });
    });

    describe('Create/Update operations', () => {
        let dbName: string;
        let db: Db;
        let dao: MongodbFabricContractCreationSubscriptionDao;

        let subscriptions: Array<Scheme.FabricContractCreationSubscription>;
        let subscription: Scheme.FabricContractCreationSubscription;

        beforeAll(async () => {
            dbName = config.get('multivest.mongodb.dbName') + 'FCCSDaoCreateUpdate';
            db = connection.db(dbName);
            dao = new MongodbFabricContractCreationSubscriptionDao(db);

            await clearCollections(db, [ DaoCollectionNames.FabricContractCreation ]);

            subscriptions = new Array(15);
            await createEntities(dao, generateFabricContractCreationSubscription, subscriptions);
        });

        beforeEach(() => {
            subscription = getRandomItem(subscriptions);
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

            const filtered = subscriptions.filter((as) => as.clientId === subscription.clientId);
            expect(got).toHaveLength(filtered.length);
            expect(got.map((item) => item.id)).toIncludeAllMembers(filtered.map((item) => item.id));
            expect(got).toSatisfyAll((item) => item.isClientActive === isClientActive);

            filtered.forEach((as) => {
                as.isClientActive = subscription.isClientActive;
            });
        });
    
        it('should set new is project active status', async () => {
            const isProjectActive = !subscription.isProjectActive;
            await dao.setProjectActive(subscription.projectId, isProjectActive);

            const got = await dao.listByProjectId(subscription.projectId);

            const filtered = subscriptions.filter((as) => as.projectId === subscription.projectId);
            expect(got).toHaveLength(filtered.length);
            expect(got.map((item) => item.id)).toIncludeAllMembers(filtered.map((item) => item.id));
            expect(got).toSatisfyAll((item) => item.isProjectActive === isProjectActive);

            filtered.forEach((as) => {
                as.isClientActive = subscription.isClientActive;
            });
        });

        it('should create subscription', async () => {
            const data = generateFabricContractCreationSubscription();
            const created = await dao.createSubscription(
                data.clientId,
                data.projectId,
                data.transportConnectionId,
                data.methodName,
                data.inputTypes,
                data.minConfirmations
            );

            expect(created._id).toBeDefined();
            expect(created.id).toBeDefined();
            expect(created.clientId).toEqual(data.clientId);
            expect(created.projectId).toEqual(data.projectId);
            expect(created.transportConnectionId).toEqual(data.transportConnectionId);
            expect(created.methodName).toEqual(data.methodName);
            expect(created.inputTypes).toEqual(data.inputTypes);
            expect(created.minConfirmations).toEqual(data.minConfirmations);

            const got = await dao.getById(created.id);
            expect(got).toBeObject();
        });
    });
});
