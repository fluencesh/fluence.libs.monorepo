import {
    DaoCollectionNames,
    Scheme,
    MongodbTransportConnectionSubscriptionDao
} from '../../src';
import 'jest-extended';
import * as config from 'config';
import {
    compareTcs,
    convertTcsByStatus,
    compareTcsArrays,
    convertListOfTcsByStatus,
    clearCollections,
    getRandomItem,
    initTransportConnectionSubscriptionsInDb
} from '../helpers';
import { Db, MongoClient } from 'mongodb';

describe('Transport Connection Subscription DAO (integration)', () => {
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
        let dao: MongodbTransportConnectionSubscriptionDao;

        let transportConnectionSubscriptions: Array<Scheme.TransportConnectionSubscription>;
        let transportConnectionSubscription: Scheme.TransportConnectionSubscription;

        beforeAll(async () => {
            dbName = config.get('multivest.mongodb.dbName') + 'TransportConnectionSubscriptionDaoRead';
            db = connection.db(dbName);

            await clearCollections(db, [
                DaoCollectionNames.TransportConnection,
                DaoCollectionNames.AddressSubscription,
                DaoCollectionNames.TransactionHashSubscription,
                DaoCollectionNames.EthereumContractSubscription,
                DaoCollectionNames.Oraclize,
                DaoCollectionNames.FabricContractCreation,
            ]);

            dao = new MongodbTransportConnectionSubscriptionDao(db);

            transportConnectionSubscriptions = await initTransportConnectionSubscriptionsInDb(db);
        });

        beforeEach(() => {
            transportConnectionSubscription = getRandomItem(transportConnectionSubscriptions);
        });

        afterAll(async () => {
            if (config.has('tests.dropDbAfterTest') && config.get('tests.dropDbAfterTest')) {
                await db.dropDatabase();
            }
        });

        it('should return transport connection with related subscriptions by ID', async () => {
            const got = await dao.getById(transportConnectionSubscription.id);
            compareTcs(got, transportConnectionSubscription);
        });
    
        it('should return transport connection with related subscriptions by ID and status (active)', async () => {
            const status = Scheme.TransportConnectionSubscriptionStatus.Subscribed;
            const got = await dao.getByIdAndStatus(
                transportConnectionSubscription.id,
                status
            );
    
            compareTcs(got, convertTcsByStatus(transportConnectionSubscription, status));
        });
    
        it('should return transport connection with related subscriptions by ID and status (inactive)', async () => {
            const status = Scheme.TransportConnectionSubscriptionStatus.Unsubscribed;
            const got = await dao.getByIdAndStatus(
                transportConnectionSubscription.id,
                status
            );
            compareTcs(got, convertTcsByStatus(transportConnectionSubscription, status));
        });
    
        it('should return list of transport connections with related subscriptions', async () => {
            const got = await dao.list();
            compareTcsArrays(got, transportConnectionSubscriptions);
        });
    
        it('should return list of transport connections with related subscriptions by status (active)', async () => {
            const status = Scheme.TransportConnectionSubscriptionStatus.Subscribed;
            const got = await dao.listByStatus(status);
            compareTcsArrays(got, convertListOfTcsByStatus(transportConnectionSubscriptions, status));
        });
    
        it('should return list of transport connections with related subscriptions by status (inactive)', async () => {
            const status = Scheme.TransportConnectionSubscriptionStatus.Unsubscribed;
            const got = await dao.listByStatus(status);
            compareTcsArrays(got, convertListOfTcsByStatus(transportConnectionSubscriptions, status));
        });
    
        it('should return transport connections with related subscriptions by IDs', async () => {
            const got = await dao.listByIds([transportConnectionSubscription.id]);
            compareTcsArrays(got, [ transportConnectionSubscription ]);
        });
    
        it('should return transport connections with related subscriptions by IDs and status (active)', async () => {
            const status = Scheme.TransportConnectionSubscriptionStatus.Subscribed;
            const got = await dao.listByIdsAndStatus([ transportConnectionSubscription.id ], status);
            compareTcsArrays(got, convertListOfTcsByStatus([ transportConnectionSubscription ], status));
        });
    
        it('should return transport connections with related subscriptions by IDs and status (inactive)', async () => {
            const status = Scheme.TransportConnectionSubscriptionStatus.Unsubscribed;
            const got = await dao.listByIdsAndStatus([ transportConnectionSubscription.id ], status);
            compareTcsArrays(got, convertListOfTcsByStatus([ transportConnectionSubscription ], status));
        });
    
        it('should return transport connections with related subscriptions by blockchainId and networkId', async () => {
            const got = await dao.listByBlockchainInfo(
                transportConnectionSubscription.blockchainId,
                transportConnectionSubscription.networkId
            );
            compareTcsArrays(got, [ transportConnectionSubscription ]);
        });
    
        it('should return tc with related subscriptions by blockchainId, networkId and status (active)', async () => {
            const status = Scheme.TransportConnectionSubscriptionStatus.Subscribed;
            const got = await dao.listByStatusAndBlockchainInfo(
                status,
                transportConnectionSubscription.blockchainId,
                transportConnectionSubscription.networkId
            );
            compareTcsArrays(got, convertListOfTcsByStatus([ transportConnectionSubscription ], status));
        });
    
        it('should return tc with related subscriptions by blockchainId, networkId and status (inactive)', async () => {
            const status = Scheme.TransportConnectionSubscriptionStatus.Unsubscribed;
            const got = await dao.listByStatusAndBlockchainInfo(
                status,
                transportConnectionSubscription.blockchainId,
                transportConnectionSubscription.networkId
            );
            compareTcsArrays(got, convertListOfTcsByStatus([ transportConnectionSubscription ], status));
        });
    });
});
