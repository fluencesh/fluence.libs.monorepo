import * as config from 'config';
import { random } from 'lodash';
import { Db, MongoClient } from 'mongodb';
import { v1 as generateId } from 'uuid';
import { MongodbTransportConnectionDao } from '../../src/dao/mongodb/transport.connection.dao';
import { Scheme } from '../../src/types';
import { randomTransportConnection } from '../helper';
import { CollectionMock, DbMock } from '../mock/db.mock';

describe('client dao', () => {
    let dao: MongodbTransportConnectionDao;
    let collection: any;

    beforeAll(async () => {
        dao = new MongodbTransportConnectionDao(DbMock);
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

    it('createTransportConnection() transfers correct arguments', async () => {
        const data = randomTransportConnection();

        await dao.createTransportConnection(
            data.blockchainId,
            data.networkId,
            data.providerId,

            data.priority,

            data.settings,

            data.status,

            data.isFailing,
            data.lastFailedAt,
            data.failedCount
        );

        expect(collection.insertOne).toHaveBeenCalledTimes(1);
    });

    it('setSettings() transfers correct arguments', async () => {
        const settings = { [generateId()]: generateId() };

        await dao.setSettings(
            'id',
            settings
        );

        expect(collection.updateMany).toHaveBeenCalledWith(
            {
                id: 'id'
            },
            {
                $set: {
                    settings
                }
            }
        );
        expect(collection.updateMany).toHaveBeenCalledTimes(1);
    });

    it('setStatus() transfers correct arguments', async () => {
        const status = Scheme.TransportConnectionStatus.Disabled;

        await dao.setStatus(
            'id',
            status
        );

        expect(collection.updateMany).toHaveBeenCalledWith(
            {
                id: 'id'
            },
            {
                $set: {
                    status
                }
            }
        );
        expect(collection.updateMany).toHaveBeenCalledTimes(1);
    });

    it('setFailed() transfers correct arguments', async () => {
        const settings = { [generateId()]: generateId() };

        await dao.setFailed(
            'id',
            false,
            null
        );

        expect(collection.updateMany).toHaveBeenCalledWith(
            {
                id: 'id'
            },
            {
                $set: {
                    isFailing: false,
                    lastFailedAt: null
                }
            }
        );
        expect(collection.updateMany).toHaveBeenCalledTimes(1);
    });
});
