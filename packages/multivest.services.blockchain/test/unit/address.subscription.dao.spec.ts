import * as config from 'config';
import { random } from 'lodash';
import { Db, MongoClient } from 'mongodb';
import { MongodbAddressSubscriptionDao } from '../../src/dao/mongodb/address.subscription.dao';
import { Scheme } from '../../src/types';
import { randomAddressSubscription } from '../helper';
import { CollectionMock, DbMock } from '../mock/db.mock';

describe('Address subscription dao', () => {
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

    it('listByClientId() transfers correct arguments', async () => {
        await dao.listByClientId('clientId');

        expect(collection.find).toHaveBeenCalledWith({ clientId: 'clientId' });
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('listByProjectId() transfers correct arguments', async () => {
        await dao.listByProjectId('projectId');

        expect(collection.find).toHaveBeenCalledWith({ projectId: 'projectId' });
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
        const data = randomAddressSubscription();
        await dao.createSubscription(
            data.clientId,
            data.projectId,
            data.blockChainId,
            data.networkId,
            data.address,
            data.minConfirmations,
            data.subscribed,
            data.isProjectActive,
            data.isClientActive
        );

        expect(collection.insertOne).toHaveBeenCalledTimes(1);
    });
});
