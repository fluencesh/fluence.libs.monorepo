import {
    MongodbProjectDao,
    Scheme
} from '@applicature-restricted/multivest.services.blockchain';
import * as config from 'config';
import { random } from 'lodash';
import { connect, Db } from 'mongodb';
import { DaoCollectionNames, DaoIds } from '../../src/constants';
import { MongodbOraclizeSubscriptionDao } from '../../src/dao/mongodb/oraclize.subscription.dao';
import { OraclizeStatus, OraclizeSubscription } from '../../src/types';
import { randomOraclize, randomProject } from '../helper';
import { CollectionMock, DbMock } from '../mock/db.mock';

describe('oraclize dao', () => {
    let dao: MongodbOraclizeSubscriptionDao;
    let collection: any;

    beforeAll(async () => {
        dao = new MongodbOraclizeSubscriptionDao(DbMock);
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

    it('getByIdAndProjectId() transfers correct arguments', async () => {
        await dao.getByIdAndProjectId('id', 'projectId');

        expect(collection.findOne).toHaveBeenCalledWith({ id: 'id', projectId: 'projectId' });
        expect(collection.findOne).toHaveBeenCalledTimes(1);
    });

    it('listByEventHash() transfers correct arguments', async () => {
        const eventHash = 'eventHash';

        await dao.listByEventHash(eventHash);

        expect(collection.find).toHaveBeenCalledWith({ eventHash });
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('listByEventHashAndStatus() transfers correct arguments', async () => {
        const eventHash = 'eventHash';
        const status = 'status' as any;

        await dao.listByEventHashAndStatus(eventHash, status);

        expect(collection.find).toHaveBeenCalledWith({ eventHash, status });
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('listByEventHashes() transfers correct arguments', async () => {
        const eventHashes = ['eventHash'];

        await dao.listByEventHashes(eventHashes);

        expect(collection.find).toHaveBeenCalledWith({ eventHash: { $in: eventHashes } });
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('listByEventHashesAndStatus() transfers correct arguments', async () => {
        const eventHashes = ['eventHash'];
        const status = 'status' as any;

        await dao.listByEventHashesAndStatus(eventHashes, status);

        expect(collection.find).toHaveBeenCalledWith({ eventHash: { $in: eventHashes }, status });
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('listByProjectId() transfers correct arguments', async () => {
        const projectId = 'projectId';

        await dao.listByProjectId(projectId);

        expect(collection.find).toHaveBeenCalledWith({ projectId });
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('listByStatus() transfers correct arguments', async () => {
        const status = 'status' as any;

        await dao.listByStatus(status);

        expect(collection.find).toHaveBeenCalledWith({ status });
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('listByStatus() transfers correct arguments', async () => {
        const status = 'status' as any;
        const projectId = 'projectId';

        await dao.listByStatusAndProjectId(status, projectId);

        expect(collection.find).toHaveBeenCalledWith({ status, projectId });
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('createOraclize() transfers correct arguments', async () => {
        const randomOraclizeEntity = randomOraclize();

        await dao.createOraclize(
            randomOraclizeEntity.projectId,
            randomOraclizeEntity.eventHash,
            randomOraclizeEntity.eventName,
            randomOraclizeEntity.eventInputTypes,
            randomOraclizeEntity.webhookUrl
        );
        expect(collection.insertOne).toHaveBeenCalledTimes(1);
    });

    it('setStatus() transfers correct arguments', async () => {
        const id = 'id';
        const status = 'status';

        await dao.setStatus(id, status as any);

        expect(collection.updateMany).toHaveBeenCalledWith({ id }, { $set: { status } });
        expect(collection.updateMany).toHaveBeenCalledTimes(1);
    });
});
