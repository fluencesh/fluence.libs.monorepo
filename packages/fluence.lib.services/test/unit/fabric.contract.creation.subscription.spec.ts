import { MongodbFabricContractCreationSubscriptionDao } from '../../src';
import { generateFabricContractCreationSubscription } from '../helpers';
import { CollectionMock, DbMock } from '../mock/db.mock';

describe('Fabric Contract Creation Subscription DAO (unit)', () => {
    let dao: MongodbFabricContractCreationSubscriptionDao;
    let collection: any;

    beforeAll(async () => {
        dao = new MongodbFabricContractCreationSubscriptionDao(DbMock);
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
            isClientActive: true,
            isProjectActive: true,
            subscribed: true
        });
        expect(collection.findOne).toHaveBeenCalledTimes(1);
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
            isClientActive: true,
            isProjectActive: true,
            subscribed: true
        });
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('listByProjectId() transfers correct arguments', async () => {
        await dao.listByProjectId('projectId');

        expect(collection.find).toHaveBeenCalledWith({ projectId: 'projectId' });
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('listByProjectIdActiveOnly() transfers correct arguments', async () => {
        await dao.listByProjectIdActiveOnly('projectId');

        expect(collection.find).toHaveBeenCalledWith({
            projectId: 'projectId',
            isClientActive: true,
            isProjectActive: true,
            subscribed: true
        });
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('setSubscribed() transfers correct arguments', async () => {
        await dao.setSubscribed('id', true);

        expect(collection.updateMany).toHaveBeenCalledWith(
            {
                id: 'id'
            },
            {
                $set: {
                    subscribed: true
                }
            }
        );
        expect(collection.updateMany).toHaveBeenCalledTimes(1);
    });

    it('setClientActive() transfers correct arguments', async () => {
        await dao.setClientActive('clientId', true);

        expect(collection.updateMany).toHaveBeenCalledWith(
            {
                clientId: 'clientId'
            },
            {
                $set: {
                    isClientActive: true
                }
            }
        );
        expect(collection.updateMany).toHaveBeenCalledTimes(1);
    });

    it('setProjectActive() transfers correct arguments', async () => {
        await dao.setProjectActive('projectId', true);

        expect(collection.updateMany).toHaveBeenCalledWith(
            {
                projectId: 'projectId'
            },
            {
                $set: {
                    isProjectActive: true
                }
            }
        );
        expect(collection.updateMany).toHaveBeenCalledTimes(1);
    });

    it('createSubscription() transfers correct arguments', async () => {
        const data = generateFabricContractCreationSubscription();
        await dao.createSubscription(
            data.clientId,
            data.projectId,
            data.transportConnectionId,
            data.methodName,
            data.inputTypes,
            data.minConfirmations
        );

        expect(collection.insertOne).toHaveBeenCalledTimes(1);
    });
});
