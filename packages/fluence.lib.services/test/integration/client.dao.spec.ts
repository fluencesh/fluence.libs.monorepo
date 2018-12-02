import * as config from 'config';
import { Db, MongoClient } from 'mongodb';
import { MongodbClientDao } from '../../src/dao/mongodb/client.dao';
import { Scheme } from '../../src/types';
import { DaoCollectionNames } from '../..';
import { createEntities, clearCollections, generateClient, getRandomItem } from '../helpers';
import 'jest-extended';

describe('Client DAO (integration)', () => {
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
        let dao: MongodbClientDao;

        let clients: Array<Scheme.Client>;
        let client: Scheme.Client;

        beforeAll(async () => {
            dbName = config.get('multivest.mongodb.dbName') + 'ClientRead';
            db = connection.db(dbName);
            dao = new MongodbClientDao(db);

            await clearCollections(db, [ DaoCollectionNames.Client ]);

            clients = new Array(15);
            await createEntities(dao, generateClient, clients);
        });

        beforeEach(() => {
            client = getRandomItem(clients);
        });

        afterAll(async () => {
            if (config.has('tests.dropDbAfterTest') && config.get('tests.dropDbAfterTest')) {
                await db.dropDatabase();
            }
        });

        it('should get by id', async () => {
            const got = await dao.getById(client.id);
            expect(got).toEqual(client);
        });

        it('should get by email', async () => {
            const got = await dao.getByEmail(client.email);
            expect(got).toEqual(client);
        });

        it('should get by email and password hash', async () => {
            const got = await dao.getByEmailAndPasswordHash(client.email, client.passwordHash);
            expect(got).toEqual(client);
        });
    });

    describe('Create/Update operations', () => {
        let dbName: string;
        let db: Db;
        let dao: MongodbClientDao;

        let clients: Array<Scheme.Client>;
        let client: Scheme.Client;

        beforeAll(async () => {
            dbName = config.get('multivest.mongodb.dbName') + 'ClientCreateUpdate';
            db = connection.db(dbName);
            dao = new MongodbClientDao(db);

            await clearCollections(db, [ DaoCollectionNames.Client ]);

            clients = new Array(15);
            await createEntities(dao, generateClient, clients);
        });

        beforeEach(() => {
            client = getRandomItem(clients);
        });

        afterAll(async () => {
            if (config.has('tests.dropDbAfterTest') && config.get('tests.dropDbAfterTest')) {
                await db.dropDatabase();
            }
        });

        it('should set status', async () => {
            const status = client.status === Scheme.ClientStatus.Active
                ? Scheme.ClientStatus.Inactive
                : Scheme.ClientStatus.Active;
            await dao.setStatus(client.id, status);

            const got = await dao.getById(client.id);
            expect(got.status).toEqual(status);

            client.status = status;
        });

        it('should set verification status', async () => {
            const isVerified = !client.isVerified;
            await dao.setVerificationStatus(client.id, isVerified);

            const got = await dao.getById(client.id);
            expect(got.isVerified).toEqual(isVerified);

            client.isVerified = isVerified;
        });

        it('should set admin status', async () => {
            const isAdmin = !client.isAdmin;
            await dao.setAdminStatus(client.id, isAdmin);

            const got = await dao.getById(client.id);
            expect(got.isAdmin).toEqual(isAdmin);
        
            client.isAdmin = isAdmin;
        });

        it('should create new client', async () => {
            const data = generateClient();
            const created = await dao.createClient(data.email, data.passwordHash, data.isAdmin);

            expect(created.email).toEqual(data.email);
            expect(created.passwordHash).toEqual(data.passwordHash);
            expect(created.isAdmin).toEqual(data.isAdmin);

            const got = await dao.getById(created.id);
            expect(got).toBeObject();

            clients.push(got);
        });
    });

    describe('Delete operations', () => {
        let dbName: string;
        let db: Db;
        let dao: MongodbClientDao;

        let clients: Array<Scheme.Client>;
        let client: Scheme.Client;

        beforeAll(async () => {
            dbName = config.get('multivest.mongodb.dbName') + 'ClientDelete';
            db = connection.db(dbName);
            dao = new MongodbClientDao(db);

            await clearCollections(db, [ DaoCollectionNames.Client ]);

            clients = new Array(15);
            await createEntities(dao, generateClient, clients);
        });

        beforeEach(() => {
            client = getRandomItem(clients);
        });

        it('should remove by id', async () => {
            await dao.removeById(client.id);
            const got = await dao.getById(client.id);
    
            expect(got).toBeNull();
    
            clients.splice(clients.indexOf(client), 1);
        });
    });
});
