import * as config from 'config';
import { omit, random } from 'lodash';
import { Db, MongoClient } from 'mongodb';
import { DaoCollectionNames } from '../../src/constants';
import { MongodbSessionDao } from '../../src/dao/mongodb/session.dao';
import { Scheme } from '../../src/types';
import { randomSession } from '../helper';

describe('session dao', () => {
    let dao: MongodbSessionDao;
    const sessions: Array<Scheme.Session> = [];
    const sessionsCount = 15;
    let session: Scheme.Session;
    let connection: Db;

    beforeAll(async () => {
        connection = await MongoClient.connect(config.get('multivest.mongodb.url'), {});

        dao = new MongodbSessionDao(connection);
        await dao.remove({});

        for (let i = 0; i < sessionsCount; i++) {
            sessions.push(await dao.create(randomSession()));
        }
    });

    beforeEach(() => {
        session = sessions[random(0, sessionsCount - 1)];
    });

    afterAll(async () => {
        await dao.remove({});

        await connection.close();
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
        const filtered = sessions.filter((s) => s.clientId === session.clientId && s.projectId === session.projectId);

        const got = await dao.listByUserInfo(session.clientId, session.projectId);

        expect(got).toEqual(filtered);
    });

    it('should get list by client id and project id (active only)', async () => {
        if (session.loggedOutAt) {
            return;
        }

        const filtered = sessions.filter((s) =>
            s.clientId === session.clientId
            && s.projectId === session.projectId
            && s.loggedOutAt === null
            && s.type === session.type
        );

        const got = await dao.listByTypeAndUserInfoActiveOnly(session.type, session.clientId, session.projectId);

        expect(got).toEqual(filtered);
    });

    it('should set disable project api key session', async () => {
        const projectApiKeySession = sessions.find((s) => s.type === Scheme.SessionType.ProjectApiKey);

        if (!projectApiKeySession) {
            return;
        }

        await dao.disableProjectApiKey(projectApiKeySession.id);
        const got = await dao.getById(projectApiKeySession.id);

        expect(got.loggedOutAt).not.toBeNull();

        projectApiKeySession.loggedOutAt = got.loggedOutAt;
    });

    it('should set disable user session', async () => {
        const userSession = sessions.find((s) => s.type === Scheme.SessionType.UserSession);

        if (!userSession) {
            return;
        }

        await dao.disableUserSession(userSession.id);
        const got = await dao.getById(userSession.id);

        expect(got.loggedOutAt).not.toBeNull();

        userSession.loggedOutAt = got.loggedOutAt;
    });

    it('should set new expired at date', async () => {
        const userSession = sessions.find((s) => s.type === Scheme.SessionType.UserSession);

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
        const data = randomSession();
        const got = await dao.createUserSession(
            data.clientId,
            data.expiredAt
        );

        expect(got.expiredAt).toEqual(data.expiredAt);
        expect(got.clientId).toEqual(data.clientId);
        expect(got.createdAt).not.toBeNull();
        expect(got.loggedOutAt).toBeNull();
    });

    it('should create new user api key', async () => {
        const data = randomSession();
        const got = await dao.createUserApiKey(
            data.clientId
        );

        expect(got.clientId).toEqual(data.clientId);
        expect(got.expiredAt).toBeNull();
        expect(got.createdAt).not.toBeNull();
        expect(got.loggedOutAt).toBeNull();
    });

    it('should create new user api key', async () => {
        const data = randomSession();
        const got = await dao.createProjectApiKey(
            data.clientId,
            data.projectId
        );

        expect(got.clientId).toEqual(data.clientId);
        expect(got.projectId).toEqual(data.projectId);
        expect(got.expiredAt).toBeNull();
        expect(got.createdAt).not.toBeNull();
        expect(got.loggedOutAt).toBeNull();
    });
});
