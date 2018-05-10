import * as config from 'config';
import { random, pick, omit } from 'lodash';
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

    it('getByApiKey() transfers correct arguments', async () => {
        await dao.getByApiKey('api-key');

        expect(collection.findOne).toHaveBeenCalledWith({ apiKey: 'api-key' });
        expect(collection.findOne).toHaveBeenCalledTimes(1);
    });

    it('listByIds() transfers correct arguments', async () => {
        await dao.listByIds(['id']);

        expect(collection.find).toHaveBeenCalledWith({ id: { $in: ['id'] } });
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('listByClientId() transfers correct arguments', async () => {
        await dao.listByClientId('clientId');

        expect(collection.find).toHaveBeenCalledWith({ clientId: 'clientId' });
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('listByFilters() transfers correct arguments', async () => {
        const filters = {
            name: 'name',
            sharedSecret: 'sharedSecret',
            status: 'status' as any,
            webhookUrl: 'webhookUrl',
        } as Partial<Scheme.Project>;

        const got = await dao.listByFilters(
            filters.name,
            filters.sharedSecret,
            filters.status,
            filters.webhookUrl
        );

        expect(collection.find).toHaveBeenCalledWith(filters);
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('createProject() transfers correct arguments', async () => {
        const data = randomProject();

        const created = await dao.createProject(
            data.clientId,
            data.name,
            data.webhookUrl,
            data.sharedSecret,
            data.status,
            data.txMinConfirmations
        );

        expect(collection.insertOne).toHaveBeenCalledTimes(1);
    });

    it('setNameAndWebhookUrlAndStatus() transfers correct arguments', async () => {
        const data = randomProject();

        await dao.setNameAndWebhookUrlAndStatus(
            'id',
            'name',
            'webhookUrl',
            Scheme.ProjectStatus.Active
        );

        expect(collection.updateMany).toHaveBeenCalledWith(
            {
                id: 'id'
            },
            {
                $set: {
                    name: 'name',
                    webhookUrl: 'webhookUrl',
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
