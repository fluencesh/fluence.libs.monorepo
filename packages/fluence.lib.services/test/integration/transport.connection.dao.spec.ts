import * as config from 'config';
import { Db, MongoClient } from 'mongodb';
import { v1 as generateId } from 'uuid';
import { MongodbTransportConnectionDao } from '../../src/dao/mongodb/transport.connection.dao';
import { Scheme } from '../../src/types';
import 'jest-extended';
import { DaoCollectionNames } from '../../src';
import { clearCollections, createEntities, generateTransportConnection, getRandomItem } from '../helpers';

describe('Transport Connection DAO (integration)', () => {
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
        let dao: MongodbTransportConnectionDao;

        let transportConnections: Array<Scheme.TransportConnection>;
        let transportConnection: Scheme.TransportConnection;

        beforeAll(async () => {
            dbName = config.get('multivest.mongodb.dbName') + 'TransportConnectionDaoRead';
            db = connection.db(dbName);
            dao = new MongodbTransportConnectionDao(db);

            await clearCollections(db, [ DaoCollectionNames.TransportConnection ]);

            transportConnections = new Array(15);
            await createEntities(dao, generateTransportConnection, transportConnections);
        });

        beforeEach(() => {
            transportConnection = getRandomItem(transportConnections);
        });

        afterAll(async () => {
            if (config.has('tests.dropDbAfterTest') && config.get('tests.dropDbAfterTest')) {
                await db.dropDatabase();
            }
        });

        it('should get transport connection by id', async () => {
            const got = await dao.getById(transportConnection.id);
            expect(got).toEqual(transportConnection);
        });
    
        it('should get transport connection by network, blockchain id and providerId', async () => {
            const got = await dao.getByBlockchainIdAndNetworkIdAndProviderId(
                transportConnection.blockchainId,
                transportConnection.networkId,
                transportConnection.providerId
            );

            expect(got).toEqual(transportConnection);
        });
    
        it('should get transport connection by network and blockchain id', async () => {
            const filtered = transportConnections.filter((tc) =>
                tc.blockchainId === transportConnection.blockchainId
                && tc.networkId === transportConnection.networkId
            );
    
            const got = await dao.listByBlockchainAndNetwork(
                transportConnection.blockchainId,
                transportConnection.networkId
            );
    
            expect(got).toEqual(filtered);
        });
    
        it('should get transport connection by network and blockchain id and status', async () => {
            const filtered = transportConnections.filter((tc) => {
                return tc.blockchainId === transportConnection.blockchainId
                    && tc.networkId === transportConnection.networkId
                    && tc.status === transportConnection.status;
            });
    
            const got = await dao.listByBlockchainAndNetworkAndStatus(
                transportConnection.blockchainId,
                transportConnection.networkId,
                transportConnection.status
            );
    
            expect(got).toEqual(filtered);
        });
    
        it('should get transport connection by network and blockchain id and status', async () => {
            const filtered = transportConnections.filter((tc) => {
                return tc.blockchainId === transportConnection.blockchainId
                    && tc.networkId === transportConnection.networkId
                    && tc.isPredefinedBySystem === transportConnection.isPredefinedBySystem;
            });
    
            const got = await dao.listByIsPredefinedStatusAndBlockchainInfo(
                transportConnection.isPredefinedBySystem,
                transportConnection.blockchainId,
                transportConnection.networkId
            );
    
            expect(got).toEqual(filtered);
        });
    });

    describe('Create/Update operations', () => {
        let dbName: string;
        let db: Db;
        let dao: MongodbTransportConnectionDao;

        let transportConnections: Array<Scheme.TransportConnection>;
        let transportConnection: Scheme.TransportConnection;

        beforeAll(async () => {
            dbName = config.get('multivest.mongodb.dbName') + 'TransportConnectionDaoCreateUpdate';
            db = connection.db(dbName);
            dao = new MongodbTransportConnectionDao(db);

            await clearCollections(db, [ DaoCollectionNames.TransportConnection ]);

            transportConnections = new Array(15);
            await createEntities(dao, generateTransportConnection, transportConnections);
        });

        beforeEach(() => {
            transportConnection = getRandomItem(transportConnections);
        });

        afterAll(async () => {
            if (config.has('tests.dropDbAfterTest') && config.get('tests.dropDbAfterTest')) {
                await db.dropDatabase();
            }
        });

        it('should create new transport connection', async () => {
            const data = generateTransportConnection();
    
            const created = await dao.createTransportConnection(
                data.blockchainId,
                data.networkId,
                data.providerId,
    
                data.priority,
    
                data.settings,
    
                data.status,
    
                data.isFailing,
                data.lastFailedAt,
                data.failedCount,
    
                data.isPrivate,
    
                data.cronExpression
            );

            expect(created.blockchainId).toEqual(data.blockchainId);
            expect(created.networkId).toEqual(data.networkId);
            expect(created.providerId).toEqual(data.providerId);
            expect(created.priority).toEqual(data.priority);
            expect(created.settings).toEqual(data.settings);
            expect(created.status).toEqual(data.status);
            expect(created.isFailing).toEqual(data.isFailing);
            expect(created.lastFailedAt).toEqual(data.lastFailedAt);
            expect(created.failedCount).toEqual(data.failedCount);
            expect(created.isPrivate).toEqual(data.isPrivate);
            expect(created.cronExpression).toEqual(data.cronExpression);
    
            const got = await dao.getById(created.id);
            expect(got).toBeObject();
        });
    
        it('should set new settings', async () => {
            const settings = { [generateId()]: generateId() };
    
            await dao.setSettings(
                transportConnection.id,
                settings
            );
    
            const got = await dao.getById(transportConnection.id);
    
            expect(got.settings).toEqual(settings);

            transportConnection.settings = settings;
        });
    
        it('should set new status', async () => {
            const status = transportConnection.status === Scheme.TransportConnectionStatus.Enabled
                ? Scheme.TransportConnectionStatus.Disabled
                : Scheme.TransportConnectionStatus.Enabled;
    
            await dao.setStatus(
                transportConnection.id,
                status
            );
    
            const got = await dao.getById(transportConnection.id);
    
            expect(got.status).toEqual(status);

            transportConnection.status = status;
        });
    
        it('should set new status by ids', async () => {
            const status = transportConnection.status === Scheme.TransportConnectionStatus.Enabled
                ? Scheme.TransportConnectionStatus.Disabled
                : Scheme.TransportConnectionStatus.Enabled;
    
            await dao.setStatusByIds(
                [ transportConnection.id ],
                status
            );
    
            const got = await dao.getById(transportConnection.id);
    
            expect(got.status).toEqual(status);

            transportConnection.status = status;
        });
    
        it('should set new failed status', async () => {
            const isFailing = !transportConnection.isFailing;
            const lastFailedAt = transportConnection.isFailing ? new Date() : null;
    
            await dao.setFailed(
                transportConnection.id,
                isFailing,
                lastFailedAt
            );
    
            const got = await dao.getById(transportConnection.id);
    
            expect(got.isFailing).toEqual(isFailing);
            expect(got.lastFailedAt).toEqual(lastFailedAt);

            transportConnection.isFailing = isFailing;
            transportConnection.lastFailedAt = lastFailedAt;
        });
    
        it('should set new failed status by blockchain ids', async () => {
            const isFailing = !transportConnection.isFailing;
            const lastFailedAt = transportConnection.isFailing ? new Date() : null;
    
            await dao.setFailedByIds(
                [ transportConnection.id ],
                isFailing,
                lastFailedAt
            );
    
            const got = await dao.getById(transportConnection.id);
    
            expect(got.isFailing).toEqual(isFailing);
            expect(got.lastFailedAt).toEqual(lastFailedAt);

            transportConnection.isFailing = isFailing;
            transportConnection.lastFailedAt = lastFailedAt;
        });
    });

    describe('Delete operations', () => {
        let dbName: string;
        let db: Db;
        let dao: MongodbTransportConnectionDao;

        let transportConnections: Array<Scheme.TransportConnection>;
        let transportConnection: Scheme.TransportConnection;

        beforeAll(async () => {
            dbName = config.get('multivest.mongodb.dbName') + 'TransportConnectionDaoDelete';
            db = connection.db(dbName);
            dao = new MongodbTransportConnectionDao(db);

            await clearCollections(db, [ DaoCollectionNames.TransportConnection ]);

            transportConnections = new Array(15);
            await createEntities(dao, generateTransportConnection, transportConnections);
        });

        beforeEach(() => {
            transportConnection = getRandomItem(transportConnections);
        });

        afterAll(async () => {
            if (config.has('tests.dropDbAfterTest') && config.get('tests.dropDbAfterTest')) {
                await db.dropDatabase();
            }
        });

        it('should remove transport connections by id', async () => {
            await dao.removeById(transportConnection.id);
    
            const got = await dao.getById(transportConnection.id);
            expect(got).toBeNull();
    
            transportConnections.splice(transportConnections.indexOf(got), 1);
        });
    
        it('should remove transport connections by ids', async () => {
            const howManyToRemove = 3;
            const transportConnectionToRemove = transportConnections.filter((tc, index) => index < howManyToRemove);
            const idsToRemove = transportConnectionToRemove.map((tc) => tc.id);
    
            await dao.removeByIds(idsToRemove);
    
            const got = await Promise.all(idsToRemove.map((id) => dao.getById(id)));
            got.forEach((tc) => {
                expect(tc).toBeNull();
            });
    
            transportConnections.splice(0, howManyToRemove);
        });
    });
});
