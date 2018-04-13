import * as config from 'config';
import { random } from 'lodash';
import { Db, MongoClient } from 'mongodb';
import { MongodbProjectDao } from '../../src/dao/mongodb/project.dao';
import { Scheme } from '../../src/types';
import { randomProject } from '../helper';
import { CollectionMock, DbMock } from '../mock/db.mock';

describe('exchange dao', () => {
    let dao: MongodbProjectDao;
    let collection: any;

    beforeAll(async () => {
        dao = new MongodbProjectDao(DbMock);
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

    it('listByClientId() transfers correct arguments', async () => {
        await dao.listByClientId('clientId');

        expect(collection.find).toHaveBeenCalledWith({ clientId: 'clientId' });
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('createProject() transfers correct arguments', async () => {
        const data = randomProject();

        const created = await dao.createProject(
            data.clientId,
            data.name,
            data.webHookUrl,
            data.sharedSecret,
            data.status
        );

        expect(collection.insertOne).toHaveBeenCalledTimes(1);
    });

    it('setNameAndWebhookUrlAndStatus() transfers correct arguments', async () => {
        const data = randomProject();

        await dao.setNameAndWebhookUrlAndStatus(
            'id',
            'name',
            'webHookUrl',
            Scheme.ProjectStatus.Active
        );

        expect(collection.updateMany).toHaveBeenCalledWith(
            {
                id: 'id'
            },
            {
                $set: {
                    name: 'name',
                    webHookUrl: 'webHookUrl',
                    status: Scheme.ProjectStatus.Active
                }
            }
        );
        expect(collection.updateMany).toHaveBeenCalledTimes(1);
    });

    it('setStatus() transfers correct arguments', async () => {
        await dao.setStatus(
            'id',
            Scheme.ProjectStatus.Active
        );

        expect(collection.updateMany).toHaveBeenCalledWith(
            {
                id: 'id'
            },
            {
                $set: {
                    status: Scheme.ProjectStatus.Active
                }
            }
        );
        expect(collection.updateMany).toHaveBeenCalledTimes(1);
    });
});