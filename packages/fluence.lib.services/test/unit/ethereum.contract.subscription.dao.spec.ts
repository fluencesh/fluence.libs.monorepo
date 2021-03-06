import { MongodbEthereumContractSubscriptionDao } from '../../src/dao/mongodb/ethereum.contract.subscription.dao';
import { generateEthereumContractSubscription } from '../helpers';
import { CollectionMock, DbMock } from '../mock/db.mock';

describe('Ethereum Contract Subscription DAO (unit)', () => {
    let dao: MongodbEthereumContractSubscriptionDao;
    let collection: any;

    beforeAll(async () => {
        dao = new MongodbEthereumContractSubscriptionDao(DbMock);
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

    it('listBySubscribedAddresses() transfers correct arguments', async () => {
        await dao.listBySubscribedAddresses([ 'address' ]);

        expect(collection.find).toHaveBeenCalledWith(
            {
                address: {
                    $in: ['address']
                },
            }
        );
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

    it('createContractSubscription() transfers correct arguments', async () => {
        const data = generateEthereumContractSubscription();
        await dao.createSubscription(
            data.clientId,
            data.projectId,
            data.compatibleStandard,
            data.transportConnectionId,
            data.address,
            data.minConfirmations,
            data.abi,
            data.abiEvents,
            data.subscribedEvents,
            data.subscribeAllEvents
        );

        expect(collection.insertOne).toHaveBeenCalledTimes(1);
    });

    it('setSubscribedEventsAndAllEvents() transfers correct arguments', async () => {
        await dao.setSubscribedEventsAndAllEvents(
            'id',
            [ 'event1', 'event2' ],
            true
        );

        expect(collection.updateMany).toHaveBeenCalledWith(
            {
                id: 'id'
            },
            {
                $set: {
                    subscribeAllEvents: true,
                    subscribedEvents: [
                        'event1',
                        'event2'
                    ]
                }
            }
        );
        expect(collection.updateMany).toHaveBeenCalledTimes(1);
    });
});
