import * as config from 'config';
import { random } from 'lodash';
import { Db, MongoClient } from 'mongodb';
import { MongodbSessionDao } from '../../src/dao/mongodb/session.dao';
import { Scheme } from '../../src/types';
import { randomClient, randomSession } from '../helper';
import { CollectionMock, DbMock } from '../mock/db.mock';

describe('session dao', () => {
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

    it('getByIdActiveOnly() transfers correct arguments', async () => {
        await dao.getByIdActiveOnly('id');

        expect(collection.findOne).toHaveBeenCalledTimes(1);
    });
    
    it('getByClientIdAndProjectId() transfers correct arguments', async () => {
        const clientId = 'clientId';
        const projectId = 'projectId';

        await dao.getByClientIdAndProjectId(clientId, projectId);

        expect(collection.findOne).toHaveBeenCalledWith({ clientId, projectId });
        expect(collection.findOne).toHaveBeenCalledTimes(1);
    });

    it('getByClientIdAndProjectIdActiveOnly() transfers correct arguments', async () => {
        const clientId = 'clientId';
        const projectId = 'projectId';

        await dao.getByClientIdAndProjectIdActiveOnly(clientId, projectId);

        expect(collection.findOne).toHaveBeenCalledTimes(1);
    });

    it('listByClientId() transfers correct arguments', async () => {
        const clientId = 'clientId';

        await dao.listByClientId(clientId);

        expect(collection.find).toHaveBeenCalledWith({ clientId });
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('listByClientIdActiveOnly() transfers correct arguments', async () => {
        const clientId = 'clientId';

        await dao.listByClientIdActiveOnly(clientId);

        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('logOut() transfers correct arguments', async () => {
        const sessionId = 'sessionId';

        await dao.logOut(sessionId);

        expect(collection.updateMany).toHaveBeenCalledTimes(1);
    });

    it('createSession() transfers correct arguments', async () => {
        const data = randomSession();
        await dao.createSession(data.expiredAt, data.clientId, data.projectId);

        expect(collection.insertOne).toHaveBeenCalledTimes(1);
    });
});
