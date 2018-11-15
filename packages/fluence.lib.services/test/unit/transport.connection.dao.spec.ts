import * as config from 'config';
import { random } from 'lodash';
import { Db, MongoClient } from 'mongodb';
import { v1 as generateId } from 'uuid';
import { MongodbTransportConnectionDao } from '../../src/dao/mongodb/transport.connection.dao';
import { Scheme } from '../../src/types';
import { randomTransportConnection } from '../helper';
import { CollectionMock, DbMock } from '../mock/db.mock';

describe('transport connection dao', () => {
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

    it('getByBlockchainIdAndNetworkIdAndProviderId() transfers correct arguments', async () => {
        const blockchainId = 'blockchainId';
        const networkId = 'networkId';
        const providerId = 'providerId';

        await dao.getByBlockchainIdAndNetworkIdAndProviderId(blockchainId, networkId, providerId);

        expect(collection.findOne).toHaveBeenCalledWith({ blockchainId, networkId, providerId });
        expect(collection.findOne).toHaveBeenCalledTimes(1);
    });

    it('listByIsPredefinedStatusAndBlockchainInfo() transfers correct arguments', async () => {
        const isPredefinedBySystem = false;
        const blockchainId = 'blockchainId';
        const networkId = 'networkId';

        await dao.listByIsPredefinedStatusAndBlockchainInfo(isPredefinedBySystem, blockchainId, networkId);

        expect(collection.find).toHaveBeenCalledWith({ blockchainId, networkId, isPredefinedBySystem });
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('listByBlockchainAndNetwork() transfers correct arguments', async () => {
        await dao.listByBlockchainAndNetwork('blockchainId', 'networkId');

        expect(collection.find).toHaveBeenCalledWith({
            blockchainId: 'blockchainId',
            networkId: 'networkId'
        });
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('listByBlockchainAndNetwork() transfers correct arguments', async () => {
        const blockchainId = 'blockchainId';
        const networkId = 'networkId';
        const status = Scheme.TransportConnectionStatus.Enabled;
        await dao.listByBlockchainAndNetworkAndStatus(blockchainId, networkId, status);

        expect(collection.find).toHaveBeenCalledWith({
            blockchainId: 'blockchainId',
            networkId: 'networkId',
            status
        });
        expect(collection.find).toHaveBeenCalledTimes(1);
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
            data.failedCount,

            data.isPrivate,

            data.cronExpression
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

    it('setStatus() transfers correct arguments', async () => {
        const ids = ['id'];
        const status = Scheme.TransportConnectionStatus.Disabled;

        await dao.setStatusByIds(
            ids,
            status
        );

        expect(collection.updateMany).toHaveBeenCalledWith({
            id: { $in: ids }
        }, {
            $set: {
                status
            }
        });
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

    it('setFailedByBlockchainIds() transfers correct arguments', async () => {
        const at = new Date();

        await dao.setFailedByIds(
            [ '1' ],
            true,
            at
        );

        expect(collection.updateMany).toHaveBeenCalledWith(
            {
                id: {
                    $in: [ '1' ]
                }
            },
            {
                $set: {
                    isFailing: true,
                    lastFailedAt: at
                }
            }
        );
        expect(collection.updateMany).toHaveBeenCalledTimes(1);
    });

    it('removeById() transfers correct arguments', async () => {
        const id = 'id';
        await dao.removeById(id);

        expect(collection.deleteMany).toHaveBeenCalledWith({ id });
        expect(collection.deleteMany).toHaveBeenCalledTimes(1);
    });

    it('removeByIds() transfers correct arguments', async () => {
        const ids = ['1', '2', '3'];
        await dao.removeByIds(ids);

        expect(collection.deleteMany).toHaveBeenCalledWith({ id: { $in: ids } });
        expect(collection.deleteMany).toHaveBeenCalledTimes(1);
    });
});
