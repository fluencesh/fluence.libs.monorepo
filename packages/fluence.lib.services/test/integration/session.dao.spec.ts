import * as config from 'config';
import { Db, MongoClient } from 'mongodb';
import { DaoCollectionNames } from '../../src/constants';
import { MongodbSessionDao } from '../../src/dao/mongodb/session.dao';
import { Scheme } from '../../src/types';
import 'jest-extended';
import { clearCollections, createEntities, generateSession, getRandomItem } from '../helpers';

describe('Session DAO (integration)', () => {
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
        let dao: MongodbSessionDao;

        let sessions: Array<Scheme.Session>;
        let session: Scheme.Session;

        beforeAll(async () => {
            dbName = config.get('multivest.mongodb.dbName') + 'SessionDaoRead';
            db = connection.db(dbName);
            dao = new MongodbSessionDao(db);

            await clearCollections(db, [ DaoCollectionNames.Session ]);

            sessions = new Array(15);
            await createEntities(dao, generateSession, sessions);
        });

        beforeEach(() => {
            session = getRandomItem(sessions);
        });

        afterAll(async () => {
            if (config.has('tests.dropDbAfterTest') && config.get('tests.dropDbAfterTest')) {
                await db.dropDatabase();
            }
        });

        it('should get by id', async () => {
            const got = await dao.getById(session.id);
            expect(got).toEqual(session);
        });
    
        it('should get by id (active only)', async () => {
            const got = await dao.getByIdAndTypeActiveOnly(session.id, session.type);
            expect(got).toEqual(session);
        });
    
        it('should get list by client id and project id', async () => {
            const filtered = sessions
                .filter((s) => s.clientId === session.clientId && s.projectId === session.projectId);
    
            const got = await dao.listByUserInfo(session.clientId, session.projectId);
    
            expect(got).toEqual(filtered);
        });
    
        it('should get list by client id and project id (active only)', async () => {
            const activeSession = sessions.find((s) => !s.loggedOutAt);
    
            const filtered = sessions.filter((s) =>
                s.clientId === activeSession.clientId
                && s.projectId === activeSession.projectId
                && s.loggedOutAt === null
                && s.type === activeSession.type
            );
    
            const got = await dao
                .listByTypeAndUserInfoActiveOnly(activeSession.type, activeSession.clientId, activeSession.projectId);
    
            expect(got).toEqual(filtered);
        });
    });

    describe('Create/Update operations', () => {
        let dbName: string;
        let db: Db;
        let dao: MongodbSessionDao;

        let sessions: Array<Scheme.Session>;
        let session: Scheme.Session;

        beforeAll(async () => {
            dbName = config.get('multivest.mongodb.dbName') + 'SessionDaoCreateUpdate';
            db = connection.db(dbName);
            dao = new MongodbSessionDao(db);

            await clearCollections(db, [ DaoCollectionNames.Session ]);

            sessions = new Array(15);
            await createEntities(dao, generateSession, sessions);
        });

        beforeEach(() => {
            session = getRandomItem(sessions);
        });

        afterAll(async () => {
            if (config.has('tests.dropDbAfterTest') && config.get('tests.dropDbAfterTest')) {
                await db.dropDatabase();
            }
        });

        it('should set disable project api key session', async () => {
            const projectApiKeySession = sessions
                .find((s) => s.type === Scheme.SessionType.ProjectApiKey && !s.loggedOutAt);
    
            if (!projectApiKeySession) {
                return;
            }
    
            await dao.disableProjectApiKey(projectApiKeySession.id);
            const got = await dao.getById(projectApiKeySession.id);
    
            expect(got.loggedOutAt).not.toBeNull();
    
            projectApiKeySession.loggedOutAt = got.loggedOutAt;
        });
    
        it('should set disable user session', async () => {
            const userSession = sessions.find((s) => s.type === Scheme.SessionType.UserSession && !s.loggedOutAt);
    
            if (!userSession) {
                return;
            }
    
            await dao.disableUserSession(userSession.id);
            const got = await dao.getById(userSession.id);
    
            expect(got.loggedOutAt).not.toBeNull();
    
            userSession.loggedOutAt = got.loggedOutAt;
        });
    
        it('should set new expired at date', async () => {
            const userSession = sessions.find((s) => s.type === Scheme.SessionType.UserSession && !s.loggedOutAt);
    
            if (!userSession) {
                return;
            }
    
            const expiredAt = new Date();
            await dao.setExpiredAt(userSession.id, expiredAt);
            const got = await dao.getById(userSession.id);
    
            expect(got.expiredAt.toString()).toEqual(expiredAt.toString());
    
            session.expiredAt = got.expiredAt;
        });
    
        it('should create new user session', async () => {
            const data = generateSession();
            const got = await dao.createUserSession(
                data.clientId,
                data.expiredAt
            );
    
            expect(got.expiredAt).toEqual(data.expiredAt);
            expect(got.clientId).toEqual(data.clientId);
            expect(got.createdAt).not.toBeNull();
            expect(got.loggedOutAt).toBeNull();
            expect(got.type).toEqual(Scheme.SessionType.UserSession);
        });
    
        it('should create new user api key', async () => {
            const data = generateSession();
            const got = await dao.createUserApiKey(
                data.clientId
            );
    
            expect(got.clientId).toEqual(data.clientId);
            expect(got.expiredAt).toBeNull();
            expect(got.createdAt).not.toBeNull();
            expect(got.loggedOutAt).toBeNull();
            expect(got.type).toEqual(Scheme.SessionType.UserApiKey);
        });
    
        it('should create new user api key', async () => {
            const data = generateSession();
            const got = await dao.createProjectApiKey(
                data.clientId,
                data.projectId
            );
    
            expect(got.clientId).toEqual(data.clientId);
            expect(got.projectId).toEqual(data.projectId);
            expect(got.expiredAt).toBeNull();
            expect(got.createdAt).not.toBeNull();
            expect(got.loggedOutAt).toBeNull();
            expect(got.type).toEqual(Scheme.SessionType.ProjectApiKey);
        });
    });
});
