import { MongodbAddressSubscriptionDao } from '../../src/dao/mongodb/address.subscription.dao';
import { generateAddressSubscription } from '../helpers';
import { CollectionMock, DbMock } from '../mock/db.mock';

describe('Address Subscription DAO (unit)', () => {
    let dao: MongodbAddressSubscriptionDao;
    let collection: any;

    beforeAll(async () => {
        dao = new MongodbAddressSubscriptionDao(DbMock);
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

    it('listBySubscribedAddress() transfers correct arguments', async () => {
        const address = 'address';
        const clientId = 'clientId';
        const projectId = 'projectId';

        await dao.listBySubscribedAddress(address, clientId, projectId);

        expect(collection.find).toHaveBeenCalledWith({ address, clientId, projectId });
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('listBySubscribedAddressActiveOnly() transfers correct arguments', async () => {
        const address = 'address';
        const clientId = 'clientId';
        const projectId = 'projectId';

        await dao.listBySubscribedAddressActiveOnly(address, clientId, projectId);

        expect(collection.find).toHaveBeenCalledWith({
            address,
            clientId,
            projectId,
            isClientActive: true,
            isProjectActive: true,
            subscribed: true
        });
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('listBySubscribedAddresses() transfers correct arguments', async () => {
        const addresses = [ 'address' ];

        await dao.listBySubscribedAddresses(addresses);

        expect(collection.find).toHaveBeenCalledWith({ address: { $in: addresses } });
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('listBySubscribedAddressesActiveOnly() transfers correct arguments', async () => {
        const addresses = [ 'address' ];

        await dao.listBySubscribedAddressesActiveOnly(addresses);

        expect(collection.find).toHaveBeenCalledWith({
            address: { $in: addresses },
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
        const data = generateAddressSubscription();
        await dao.createSubscription(
            data.clientId,
            data.projectId,
            data.transportConnectionId,
            data.address,
            data.minConfirmations
        );

        expect(collection.insertOne).toHaveBeenCalledTimes(1);
    });
});
