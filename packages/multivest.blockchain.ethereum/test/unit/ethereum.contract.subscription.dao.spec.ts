import * as config from 'config';
import { random } from 'lodash';
import { Db, MongoClient } from 'mongodb';
import { MongodbEthereumContractSubscriptionDao } from '../../src/dao/mongodb/ethereum.contract.subscription.dao';
import { randomEthereumContractSubscription } from '../helper';
import { CollectionMock, DbMock } from '../mock/db.mock';

describe('ethereum contract subscription dao', () => {
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

    it('listByProjectId() transfers correct arguments', async () => {
        await dao.listByProjectId('projectId');

        expect(collection.find).toHaveBeenCalledWith({ projectId: 'projectId' });
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('listByClientId() transfers correct arguments', async () => {
        await dao.listByClientId('clientId');

        expect(collection.find).toHaveBeenCalledWith({ clientId: 'clientId' });
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('listBySubscribedAddresses() transfers correct arguments', async () => {
        const got = await dao.listBySubscribedAddresses([ 'address' ]);

        expect(collection.find).toHaveBeenCalledWith(
            {
                address: {
                    $in: ['address']
                },
                isProjectActive: true,
                isClientActive: true
            }
        );
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('createContractSubscription() transfers correct arguments', async () => {
        const data = randomEthereumContractSubscription();
        await dao.createContractSubscription(
            data.clientId,
            data.projectId,
            data.compatibleStandard,
            data.blockChainId,
            data.networkId,
            data.address,
            data.minConfirmations,
            data.abi,
            data.abiEvents,
            data.subscribedEvents,
            data.subscribeAllEvents,
            data.subscribed,
            data.isProjectActive,
            data.isClientActive
        );

        expect(collection.insertOne).toHaveBeenCalledTimes(1);
    });

    it('setProjectActive() transfers correct arguments', async () => {
        await dao.setProjectActive(
            'projectId',
            true
        );

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

    it('setClientActive() transfers correct arguments', async () => {
        await dao.setClientActive(
            'clientId',
            true
        );

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
