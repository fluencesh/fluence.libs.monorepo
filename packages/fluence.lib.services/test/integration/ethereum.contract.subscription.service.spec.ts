import * as config from 'config';
import { Db, MongoClient } from 'mongodb';
import { MongodbEthereumContractSubscriptionDao } from '../../src/dao/mongodb/ethereum.contract.subscription.dao';
import { Scheme } from '../../src/types';
import { DaoCollectionNames, EthereumContractSubscriptionService } from '../../src';
import { clearCollections, createEntities, generateEthereumContractSubscription, getRandomItem } from '../helpers';
import 'jest-extended';

describe('Contract Subscription Service (integration)', () => {
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
        let service: EthereumContractSubscriptionService;

        let subscriptions: Array<Scheme.EthereumContractSubscription>;
        let subscription: Scheme.EthereumContractSubscription;
        let activeSubscription: Scheme.EthereumContractSubscription;

        beforeAll(async () => {
            dbName = config.get('multivest.mongodb.dbName') + 'ContractSubscriptionServiceRead';
            db = connection.db(dbName);

            const dao = new MongodbEthereumContractSubscriptionDao(db);
            service = new EthereumContractSubscriptionService(null);
            (service as any).ethereumContractSubscriptionDao = dao;

            await clearCollections(db, [ DaoCollectionNames.EthereumContractSubscription ]);

            subscriptions = new Array(15);
            await createEntities(dao, generateEthereumContractSubscription, subscriptions);
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
            const got = await service.getById(subscription.id);

            expect(got).toEqual(subscription);
        });

        it('should get by id (active only)', async () => {
            if (!activeSubscription) {
                return;
            }

            const got = await service.getByIdActiveOnly(activeSubscription.id);

            expect(got).toEqual(activeSubscription);
        });

        it('should get by project id', async () => {
            const filtered = subscriptions
                .filter((s) => s.projectId === subscription.projectId);
            const got = await service.listByProjectId(subscription.projectId);

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

            const got = await service.listByProjectIdActiveOnly(activeSubscription.projectId);

            expect(got).toEqual(filtered);
        });

        it('should get by client id', async () => {
            const filtered = subscriptions
                .filter((s) => s.clientId === subscription.clientId);
            const got = await service.listByClientId(subscription.clientId);

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

            const got = await service.listByClientIdActiveOnly(activeSubscription.clientId);

            expect(got).toEqual(filtered);
        });

        it('should get by id & project id & client id', async () => {
            const filtered = subscriptions.filter((s) =>
                s.address === subscription.address
                && s.clientId === subscription.clientId
                && s.projectId === subscription.projectId
            );

            const got = await service.listBySubscribedAddress(
                subscription.address,
                subscription.clientId,
                subscription.projectId
            );
    
            expect(got).toEqual(filtered);
        });
    
        it('should get by id & project id & client id (active only)', async () => {
            if (!activeSubscription) {
                return;
            }

            const filtered = subscriptions.filter((s) =>
                s.subscribed
                && s.isClientActive
                && s.isProjectActive
                && s.address === activeSubscription.address
                && s.clientId === activeSubscription.clientId
                && s.projectId === activeSubscription.projectId
            );
    
            const got = await service.listBySubscribedAddressActiveOnly(
                activeSubscription.address,
                activeSubscription.clientId,
                activeSubscription.projectId
            );
    
            expect(got).toEqual(filtered);
        });
    });

    describe('Create/Update operations', () => {
        let dbName: string;
        let db: Db;
        let service: EthereumContractSubscriptionService;

        let subscriptions: Array<Scheme.EthereumContractSubscription>;
        let subscription: Scheme.EthereumContractSubscription;

        beforeAll(async () => {
            dbName = config.get('multivest.mongodb.dbName') + 'ContractSubscriptionServiceRead';
            db = connection.db(dbName);

            const dao = new MongodbEthereumContractSubscriptionDao(db);
            service = new EthereumContractSubscriptionService(null);
            (service as any).ethereumContractSubscriptionDao = dao;

            await clearCollections(db, [ DaoCollectionNames.EthereumContractSubscription ]);

            subscriptions = new Array(15);
            await createEntities(dao, generateEthereumContractSubscription, subscriptions);
        });

        beforeEach(() => {
            subscription = getRandomItem(subscriptions);
        });

        afterAll(async () => {
            if (config.has('tests.dropDbAfterTest') && config.get('tests.dropDbAfterTest')) {
                await db.dropDatabase();
            }
        });

        it('should create new ethereum contract subscription', async () => {
            const data = generateEthereumContractSubscription();
            const created = await service.createSubscription(
                data.clientId,
                data.projectId,
                data.compatibleStandard,
                data.transportConnectionId,
                data.address,
                data.minConfirmations,
                data.abi,
                data.abiEvents,
                data.subscribedEvents,
                data.subscribeAllEvents
            );

            expect(created.clientId).toEqual(data.clientId);
            expect(created.projectId).toEqual(data.projectId);
            expect(created.compatibleStandard).toEqual(data.compatibleStandard);
            expect(created.transportConnectionId).toEqual(data.transportConnectionId);
            expect(created.address).toEqual(data.address);
            expect(created.minConfirmations).toEqual(data.minConfirmations);
            expect(created.abi).toEqual(data.abi);
            expect(created.abiEvents).toEqual(data.abiEvents);
            expect(created.subscribedEvents).toEqual(data.subscribedEvents);
            expect(created.subscribeAllEvents).toEqual(data.subscribeAllEvents);

            const got = await service.getById(created.id);
            expect(got).toBeObject();
        });

        it('should set subscribed all events status', async () => {
            const subscribedEvents = ['data', 'exit'];
            const subscribeAllEvents = !subscription.subscribeAllEvents;

            await service.setSubscribedEventsAndAllEvents(
                subscription.id,
                subscribedEvents,
                subscribeAllEvents
            );

            const got = await service.getById(subscription.id);

            expect(got.subscribedEvents).toEqual(subscribedEvents);
            expect(got.subscribeAllEvents).toEqual(subscribeAllEvents);

            subscription.subscribedEvents = subscribedEvents;
            subscription.subscribeAllEvents = subscribeAllEvents;
        });
    });
});
