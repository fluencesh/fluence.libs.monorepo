import * as config from 'config';
import { random } from 'lodash';
import { Db, MongoClient } from 'mongodb';
import { MongodbTransactionHashSubscriptionDao } from '../../src/dao/mongodb/transaction.hash.subscription.dao';
import { Scheme } from '../../src/types';
import { randomTransactionSubscription } from '../helper';
import { CollectionMock, DbMock } from '../mock/db.mock';

describe('Address subscription dao', () => {
    let dao: MongodbTransactionHashSubscriptionDao;
    let collection: any;

    beforeAll(async () => {
        dao = new MongodbTransactionHashSubscriptionDao(DbMock);
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

    it('listBySubscribedHash() transfers correct arguments', async () => {
        const hash = 'hash';
        const clientId = 'clientId';
        const projectId = 'projectId';

        await dao.listBySubscribedHash(hash, clientId, projectId);

        expect(collection.find).toHaveBeenCalledWith({ hash, clientId, projectId });
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('listBySubscribedHashes() transfers correct arguments', async () => {
        const hashes = [ 'hash' ];

        await dao.listBySubscribedHashes(hashes);

        expect(collection.find).toHaveBeenCalledWith({ hash: { $in: hashes } });
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
        const data = randomTransactionSubscription();
        await dao.createSubscription(
            data.clientId,
            data.projectId,
            data.blockchainId,
            data.networkId,
            data.hash,
            data.minConfirmations
        );

        expect(collection.insertOne).toHaveBeenCalledTimes(1);
    });
});
