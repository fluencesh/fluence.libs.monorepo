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
        dao.remove({});

        for (let i = 0; i < sessionsCount; i++) {
            sessions.push(await dao.create(randomSession()));
        }
    });

    beforeEach(() => {
        session = sessions[random(0, sessionsCount - 1)];
    });

    afterAll(async () => {
        await connection.db('multivest').collection(DaoCollectionNames.Session).remove({});

        connection.close();
    });

    it('should get by id', async () => {
        const got = await dao.getById(session.id);

        expect(got).toEqual(session);
    });

    it('should get by id (active only)', async () => {
        const got = await dao.getByIdActiveOnly(session.id);

        expect(got).toEqual(session);
    });

    it('should get by client id and project id', async () => {
        const got = await dao.getByClientIdAndProjectId(session.clientId, session.projectId);

        expect(got).toEqual(session);
    });

    it('should get by client and project ids (active only)', async () => {
        if (session.loggedOutAt) {
            return;
        }

        const got = await dao.getByClientIdAndProjectIdActiveOnly(session.clientId, session.projectId);

        expect(got).toEqual(session);
    });

    it('should set log out time', async () => {
        await dao.logOut(session.id);
        const got = await dao.getById(session.id);

        expect(got.loggedOutAt).not.toBeNull();

        session.loggedOutAt = got.loggedOutAt;
    });

    it('should set new expired at date', async () => {
        const expiredAt = new Date();
        await dao.setExpiredAt(session.id, expiredAt);
        const got = await dao.getById(session.id);

        expect(got.expiredAt.toString()).toEqual(expiredAt.toString());

        session.expiredAt = got.expiredAt;
    });

    it('should create new session', async () => {
        const data = randomSession();
        const got = await dao.createSession(
            data.expiredAt,
            data.clientId,
            data.projectId
        );

        expect(got.expiredAt).toEqual(data.expiredAt);
        expect(got.clientId).toEqual(data.clientId);
        expect(got.projectId).toEqual(data.projectId);
        expect(got.createdAt).not.toBeNull();
        expect(got.loggedOutAt).toBeNull();
    });
});
