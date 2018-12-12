import { MongodbSessionDao } from '../../src/dao/mongodb/session.dao';
import { Scheme } from '../../src/types';
import { generateSession } from '../helpers';
import { CollectionMock, DbMock } from '../mock/db.mock';

describe('Session DAO (unit)', () => {
    let dao: MongodbSessionDao;
    let collection: any;

    beforeAll(async () => {
        dao = new MongodbSessionDao(DbMock);
        collection = CollectionMock as any;
    });

    beforeEach(() => {
        Object.keys(collection).forEach((key) => {
            const spy = collection[key] as jest.SpyInstance;
            spy.mockClear();
        });
    });

    it('getById() transfers correct arguments', async () => {
        await dao.getById('id');

        expect(collection.findOne).toHaveBeenCalledWith({ id: 'id' });
        expect(collection.findOne).toHaveBeenCalledTimes(1);
    });

    it('getByIdAndTypeActiveOnly() transfers correct arguments', async () => {
        const id = 'id';
        const type = Scheme.SessionType.ProjectApiKey;
        await dao.getByIdAndTypeActiveOnly(id, type);

        expect(collection.findOne).toHaveBeenCalledTimes(1);
        expect(collection.findOne).toHaveBeenCalledWith({ id, loggedOutAt: null, type });
    });
    
    it('listByUserInfo() transfers correct arguments', async () => {
        const clientId = 'clientId';
        const projectId = 'projectId';

        await dao.listByUserInfo(clientId, projectId);

        expect(collection.find).toHaveBeenCalledWith({ clientId, projectId });
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('listByTypeAndUserInfoActiveOnly() transfers correct arguments', async () => {
        const clientId = 'clientId';
        const projectId = 'projectId';
        const type = Scheme.SessionType.ProjectApiKey;

        await dao.listByTypeAndUserInfoActiveOnly(type, clientId, projectId);

        expect(collection.find).toHaveBeenCalledTimes(1);
        expect(collection.find).toHaveBeenCalledWith({
            clientId,
            projectId,
            type,
            loggedOutAt: null
        });
    });

    it('disableUserSession() transfers correct arguments', async () => {
        const sessionId = 'sessionId';

        await dao.disableUserSession(sessionId);

        expect(collection.updateMany).toHaveBeenCalledTimes(1);
    });

    it('disableUserSession() transfers correct arguments', async () => {
        const sessionId = 'sessionId';

        await dao.disableUserApiKey(sessionId);

        expect(collection.updateMany).toHaveBeenCalledTimes(1);
    });

    it('disableProjectApiKey() transfers correct arguments', async () => {
        const sessionId = 'sessionId';

        await dao.disableProjectApiKey(sessionId);

        expect(collection.updateMany).toHaveBeenCalledTimes(1);
    });

    it('setExpiredAt() transfers correct arguments', async () => {
        const sessionId = 'sessionId';
        const expiredAt = new Date();

        await dao.setExpiredAt(sessionId, expiredAt);

        expect(collection.updateMany).toHaveBeenCalledTimes(1);
        expect(collection.updateMany).toHaveBeenCalledWith({ id: sessionId, type: Scheme.SessionType.UserSession }, {
            $set: {
                expiredAt
            }
        });
    });

    it('createUserSession() transfers correct arguments', async () => {
        const data = generateSession();
        await dao.createUserSession(data.clientId, data.expiredAt);

        expect(collection.insertOne).toHaveBeenCalledTimes(1);
    });

    it('createUserSession() transfers correct arguments', async () => {
        const data = generateSession();
        await dao.createUserApiKey(data.clientId);

        expect(collection.insertOne).toHaveBeenCalledTimes(1);
    });

    it('createProjectApiKey() transfers correct arguments', async () => {
        const data = generateSession();
        await dao.createProjectApiKey(data.clientId, data.projectId);

        expect(collection.insertOne).toHaveBeenCalledTimes(1);
    });
});
