import * as config from 'config';
import { MongodbAddressSubscriptionDao } from '../../src/dao/mongodb/address.subscription.dao';
import { Scheme } from '../../src/types';
import {
    getRandomItem,
    createEntities,
    generateAddressSubscription,
    clearCollections
} from '../helpers';
import { DaoCollectionNames } from '../../src';
import { MongoClient, Db } from 'mongodb';
import 'jest-extended';

describe('Address Subscription DAO (integration)', () => {
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
        let dao: MongodbAddressSubscriptionDao;

        let addressSubscriptions: Array<Scheme.AddressSubscription>;
        let addressSubscription: Scheme.AddressSubscription;
        let activeAddressSubscription: Scheme.AddressSubscription;

        beforeAll(async () => {
            dbName = config.get('multivest.mongodb.dbName') + 'AddressSubscriptionsRead';
            db = connection.db(dbName);
            dao = new MongodbAddressSubscriptionDao(db);

            await clearCollections(db, [ DaoCollectionNames.AddressSubscription ]);

            addressSubscriptions = new Array(15);
            await createEntities(dao, generateAddressSubscription, addressSubscriptions);
        });

        beforeEach(() => {
            addressSubscription = getRandomItem(addressSubscriptions);
            activeAddressSubscription = getRandomItem(
                addressSubscriptions,
                (item) => item.subscribed && item.isClientActive && item.isProjectActive
            );
        });

        afterAll(async () => {
            if (config.has('tests.dropDbAfterTest') && config.get('tests.dropDbAfterTest')) {
                await db.dropDatabase();
            }
        });

        it('should get by id', async () => {
            const got = await dao.getById(addressSubscription.id);
            expect(got).toEqual(addressSubscription);
        });

        it('should get by id (active only)', async () => {
            if (!activeAddressSubscription) {
                return;
            }

            const got = await dao.getByIdActiveOnly(activeAddressSubscription.id);

            expect(got).toEqual(activeAddressSubscription);
        });

        it('should get by client id', async () => {
            const filtered = addressSubscriptions.filter((as) => as.clientId === addressSubscription.clientId);
            const got = await dao.listByClientId(addressSubscription.clientId);
            expect(got).toEqual(filtered);
        });

        it('should get by client id (active only)', async () => {
            const filtered = addressSubscriptions
                .filter((item) =>
                    item.subscribed
                    && item.isClientActive
                    && item.isProjectActive
                    && item.clientId === activeAddressSubscription.clientId
                );

            if (filtered.length === 0) {
                return;
            }

            const got = await dao.listByClientIdActiveOnly(filtered[0].clientId);

            expect(got).toEqual(filtered);
        });

        it('should get by project id', async () => {
            const filtered = addressSubscriptions.filter((as) => as.projectId === addressSubscription.projectId);
            const got = await dao.listByProjectId(addressSubscription.projectId);
            expect(got).toEqual(filtered);
        });

        it('should get by project id (active only)', async () => {
            const filtered = addressSubscriptions
                .filter((item) =>
                    item.subscribed
                    && item.isClientActive
                    && item.isProjectActive
                    && item.projectId === activeAddressSubscription.projectId
                );

            if (filtered.length === 0) {
                return;
            }

            const got = await dao.listByProjectIdActiveOnly(filtered[0].projectId);

            expect(got).toEqual(filtered);
        });

        it('should get by id & project id & client id', async () => {
            const got = await dao.listBySubscribedAddress(
                addressSubscription.address,
                addressSubscription.clientId,
                addressSubscription.projectId
            );

            expect(got).toEqual([addressSubscription]);
        });

        it('should get by id & project id & client id (active only)', async () => {
            const filtered = addressSubscriptions
                .filter((item) =>
                    item.subscribed
                    && item.isClientActive
                    && item.isProjectActive
                    && item.clientId === activeAddressSubscription.clientId
                    && item.projectId === activeAddressSubscription.projectId
                );

            if (filtered.length === 0) {
                return;
            }

            const got = await dao.listBySubscribedAddressActiveOnly(
                activeAddressSubscription.address,
                activeAddressSubscription.clientId,
                activeAddressSubscription.projectId
            );

            expect(got).toEqual(filtered);
        });
    });

    describe('Create/Update operations', () => {
        let dbName: string;
        let db: Db;
        let dao: MongodbAddressSubscriptionDao;

        let addressSubscriptions: Array<Scheme.AddressSubscription>;
        let addressSubscription: Scheme.AddressSubscription;

        beforeAll(async () => {
            dbName = config.get('multivest.mongodb.dbName') + 'AddressSubscriptionsCreateUpdate';
            db = connection.db(dbName);
            dao = new MongodbAddressSubscriptionDao(db);

            await clearCollections(db, [ DaoCollectionNames.AddressSubscription ]);

            addressSubscriptions = new Array(15);
            await createEntities(dao, generateAddressSubscription, addressSubscriptions);
        });

        beforeEach(() => {
            addressSubscription = getRandomItem(addressSubscriptions);
        });

        afterAll(async () => {
            if (config.has('tests.dropDbAfterTest') && config.get('tests.dropDbAfterTest')) {
                await db.dropDatabase();
            }
        });

        it('should set new subscriber status', async () => {
            const subscribed = !addressSubscription.subscribed;
            await dao.setSubscribed(addressSubscription.id, subscribed);

            const got = await dao.getById(addressSubscription.id);
            expect(got.subscribed).toEqual(subscribed);

            addressSubscription.subscribed = subscribed;
        });
    
        it('should set new is client active status', async () => {
            const isClientActive = !addressSubscription.isClientActive;
            await dao.setClientActive(addressSubscription.clientId, isClientActive);

            const got = await dao.listByClientId(addressSubscription.clientId);

            const filtered = addressSubscriptions.filter((as) => as.clientId === addressSubscription.clientId);
            expect(got).toHaveLength(filtered.length);
            expect(got.map((item) => item.id)).toIncludeAllMembers(filtered.map((item) => item.id));
            expect(got).toSatisfyAll((item: Scheme.AddressSubscription) => item.isClientActive === isClientActive);

            filtered.forEach((as) => {
                as.isClientActive = addressSubscription.isClientActive;
            });
        });
    
        it('should set new is project active status', async () => {
            const isProjectActive = !addressSubscription.isProjectActive;
            await dao.setProjectActive(addressSubscription.projectId, isProjectActive);

            const got = await dao.listByProjectId(addressSubscription.projectId);

            const filtered = addressSubscriptions.filter((as) => as.projectId === addressSubscription.projectId);
            expect(got).toHaveLength(filtered.length);
            expect(got.map((item) => item.id)).toIncludeAllMembers(filtered.map((item) => item.id));
            expect(got).toSatisfyAll((item: Scheme.AddressSubscription) => item.isProjectActive === isProjectActive);

            filtered.forEach((as) => {
                as.isClientActive = addressSubscription.isClientActive;
            });
        });

        it('should create subscription', async () => {
            const data = generateAddressSubscription();
            const created = await dao.createSubscription(
                data.clientId,
                data.projectId,
                data.transportConnectionId,
                data.address,
                data.minConfirmations
            );

            expect(created._id).toBeDefined();
            expect(created.id).toBeDefined();
            expect(created.clientId).toEqual(data.clientId);
            expect(created.projectId).toEqual(data.projectId);
            expect(created.transportConnectionId).toEqual(data.transportConnectionId);
            expect(created.address).toEqual(data.address);
            expect(created.minConfirmations).toEqual(data.minConfirmations);

            const got = await dao.getById(created.id);
            expect(got).toBeObject();
        });
    });
});
