import { MongodbProjectBlockchainSetupDao } from '../../src/dao/mongodb';
import { Scheme } from '../../src/types';
import { generateProjectBlockchainSetup } from '../helpers';
import { CollectionMock, DbMock } from '../mock/db.mock';

describe('Project Blockchain Setup DAO (unit)', () => {
    let dao: MongodbProjectBlockchainSetupDao;
    let collection: any;

    beforeAll(async () => {
        dao = new MongodbProjectBlockchainSetupDao(DbMock);
        collection = CollectionMock as any;
    });

    beforeEach(() => {
        Object.keys(collection).forEach((key) => {
            const spy = collection[key] as jest.SpyInstance;
            spy.mockClear();
        });
    });

    it('getById() transfers correct arguments', async () => {
        const id = 'id';
        await dao.getById(id);

        expect(collection.findOne).toHaveBeenCalledWith({ id });
        expect(collection.findOne).toHaveBeenCalledTimes(1);
    });

    it('getByIdAndProjectId() transfers correct arguments', async () => {
        const id = 'id';
        const projectId = 'projectId';
        await dao.getByIdAndProjectId(id, projectId);

        expect(collection.findOne).toHaveBeenCalledWith({ id, projectId });
        expect(collection.findOne).toHaveBeenCalledTimes(1);
    });

    it('getByTransportConnectionId() transfers correct arguments', async () => {
        const privateTransportConnectionId = 'privateTransportConnectionId';
        await dao.getByTransportConnectionId(privateTransportConnectionId);

        expect(collection.findOne).toHaveBeenCalledWith({ privateTransportConnectionId });
        expect(collection.findOne).toHaveBeenCalledTimes(1);
    });

    it('getByTransportConnectionIdAndProjectId() transfers correct arguments', async () => {
        const projectId = 'projectId';
        const privateTransportConnectionId = 'privateTransportConnectionId';
        await dao.getByTransportConnectionIdAndProjectId(privateTransportConnectionId, projectId);

        expect(collection.findOne).toHaveBeenCalledWith({ privateTransportConnectionId, projectId });
        expect(collection.findOne).toHaveBeenCalledTimes(1);
    });

    it('listByProjectId() transfers correct arguments', async () => {
        const projectId = 'projectId';
        await dao.listByProjectId(projectId);

        expect(collection.find).toHaveBeenCalledWith({ projectId });
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('createSetup() transfers correct arguments', async () => {
        const data = generateProjectBlockchainSetup();
        await dao.createSetup(data.projectId, data.blockchainId, data.privateTransportConnectionId);

        expect(collection.insertOne).toHaveBeenCalledTimes(1);
    });

    it('setStatus() transfers correct arguments', async () => {
        const id = 'id';
        const status = Scheme.ProjectBlockchainSetupStatus.Enabled;
        await dao.setStatus(id, status);

        expect(collection.updateMany).toHaveBeenCalledWith({ id }, { $set: { status } });
        expect(collection.updateMany).toHaveBeenCalledTimes(1);
    });

    it('setStatusByProjectId() transfers correct arguments', async () => {
        const projectId = 'id';
        const status = Scheme.ProjectBlockchainSetupStatus.Enabled;
        await dao.setStatusByProjectId(projectId, status);

        expect(collection.updateMany).toHaveBeenCalledWith({ projectId }, { $set: { status } });
        expect(collection.updateMany).toHaveBeenCalledTimes(1);
    });

    it('removeById() transfers correct arguments', async () => {
        const id = 'id';
        await dao.removeById(id);

        expect(collection.deleteMany).toHaveBeenCalledWith({ id });
        expect(collection.deleteMany).toHaveBeenCalledTimes(1);
    });

    it('removeByProjectId() transfers correct arguments', async () => {
        const projectId = 'id';
        await dao.removeByProjectId(projectId);

        expect(collection.deleteMany).toHaveBeenCalledWith({ projectId });
        expect(collection.deleteMany).toHaveBeenCalledTimes(1);
    });
});
