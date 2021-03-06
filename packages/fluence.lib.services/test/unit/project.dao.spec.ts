import { generate } from 'randomstring';
import { MongodbProjectDao } from '../../src/dao/mongodb/project.dao';
import { Scheme } from '../../src/types';
import { generateProject } from '../helpers';
import { CollectionMock, DbMock } from '../mock/db.mock';

describe('Project DAO (unit)', () => {
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

    it('getByIdActiveOnly() transfers correct arguments', async () => {
        await dao.getByIdActiveOnly('id');

        expect(collection.findOne).toHaveBeenCalledWith({
            id: 'id',
            status: Scheme.ProjectStatus.Active,
            isRemoved: false
        });
        expect(collection.findOne).toHaveBeenCalledTimes(1);
    });

    it('getByIdExistsOnly() transfers correct arguments', async () => {
        await dao.getByIdExistsOnly('id');

        expect(collection.findOne).toHaveBeenCalledWith({
            id: 'id',
            isRemoved: false
        });
        expect(collection.findOne).toHaveBeenCalledTimes(1);
    });

    it('listByIds() transfers correct arguments', async () => {
        await dao.listByIds(['id']);

        expect(collection.find).toHaveBeenCalledWith({ id: { $in: ['id'] } });
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('listByIdsActiveOnly() transfers correct arguments', async () => {
        await dao.listByIdsActiveOnly(['id']);

        expect(collection.find).toHaveBeenCalledWith({
            id: { $in: ['id'] },
            status: Scheme.ProjectStatus.Active,
            isRemoved: false
        });
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('listByClientId() transfers correct arguments', async () => {
        await dao.listByClientId('clientId');

        expect(collection.find).toHaveBeenCalledWith({ clientId: 'clientId' });
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('listByClientIdActiveOnly() transfers correct arguments', async () => {
        await dao.listByClientIdActiveOnly('clientId');

        expect(collection.find).toHaveBeenCalledWith({
            clientId: 'clientId',
            status: Scheme.ProjectStatus.Active,
            isRemoved: false
        });
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('listByFilters() transfers correct arguments', async () => {
        const filters = {
            name: 'name',
            sharedSecret: 'sharedSecret',
            status: 'status' as any,
            webhookUrl: 'webhookUrl',
            clientId: 'id'
        } as Partial<Scheme.Project>;

        await dao.listByFilters(
            filters.name,
            filters.sharedSecret,
            filters.status,
            filters.webhookUrl,
            filters.clientId
        );

        expect(collection.find).toHaveBeenCalledWith(filters);
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('listByFiltersActiveOnly() transfers correct arguments', async () => {
        const filters = {
            name: 'name',
            sharedSecret: 'sharedSecret',
            status: 'status' as any,
            webhookUrl: 'webhookUrl',
            clientId: 'id'
        } as Partial<Scheme.Project>;

        await dao.listByFiltersActiveOnly(
            filters.name,
            filters.sharedSecret,
            filters.status,
            filters.webhookUrl,
            filters.clientId
        );

        expect(collection.find).toHaveBeenCalledWith(
            Object.assign(filters, {
                isRemoved: false
            })
        );
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('createProject() transfers correct arguments', async () => {
        const data = generateProject();

        await dao.createProject(
            data.clientId,
            data.name,
            data.webhookUrl,
            data.sharedSecret,
            data.status,
            data.txMinConfirmations,
            data.saltyToken,
            data.salt
        );

        expect(collection.insertOne).toHaveBeenCalledTimes(1);
    });

    it('setNameAndWebhookUrlAndStatus() transfers correct arguments', async () => {
        const data = generateProject();

        await dao.setNameAndWebhookUrlAndStatus(
            data.id,
            data.name,
            data.webhookUrl,
            Scheme.ProjectStatus.Active
        );

        expect(collection.updateMany).toHaveBeenCalledWith(
            {
                id: data.id
            },
            {
                $set: {
                    name: data.name,
                    webhookUrl: data.webhookUrl,
                    status: Scheme.ProjectStatus.Active
                }
            }
        );
        expect(collection.updateMany).toHaveBeenCalledTimes(1);
    });

    it('setStatus() transfers correct arguments', async () => {
        await dao.setStatus('id', Scheme.ProjectStatus.Active);

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

    it('setToken() transfers correct arguments', async () => {
        const salt = generate();
        const saltyToken = generate();

        await dao.setToken('id', saltyToken, salt);

        expect(collection.updateMany).toHaveBeenCalledWith(
            {
                id: 'id'
            },
            {
                $set: {
                    salt,
                    saltyToken
                }
            }
        );
        expect(collection.updateMany).toHaveBeenCalledTimes(1);
    });
});
