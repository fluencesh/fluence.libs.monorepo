import { Transaction } from '@applicature/multivest.core';
import { MongodbScheduledTxDao } from '../../src/dao/mongodb/scheduled.tx.dao';
import { randomTransactionScheme } from '../helper';
import { CollectionMock, DbMock } from '../mock/db.mock';

describe('address subscription dao', () => {
    let dao: MongodbScheduledTxDao;
    let collection: any;

    beforeAll(async () => {
        dao = new MongodbScheduledTxDao(DbMock);
        collection = CollectionMock as any;
    });

    beforeEach(() => {
        Object.keys(collection).forEach((key) => {
            const spy = collection[key] as jest.SpyInstance;
            spy.mockClear();
        });
    });

    it('`getById` should pass correct params', async () => {
        const id = 'id';
        await dao.getById(id);

        expect(collection.findOne).toHaveBeenCalledTimes(1);
        expect(collection.findOne).toBeCalledWith({ id });
    });

    it('`getByIdAndProjectId` should pass correct params', async () => {
        const id = 'id';
        const projectId = 'projectId';
        await dao.getByIdAndProjectId(id, projectId);

        expect(collection.findOne).toHaveBeenCalledTimes(1);
        expect(collection.findOne).toBeCalledWith({ id, projectId });
    });

    it('`listByProjectId` should pass correct params', async () => {
        const projectId = 'projectId';
        await dao.listByProjectId(projectId);

        expect(collection.find).toHaveBeenCalledTimes(1);
        expect(collection.find).toBeCalledWith({ projectId });
    });

    it('`createScheduledTx` should pass correct params', async () => {
        await dao.createScheduledTx('projectId', '* * * ? * * *', {} as Transaction, '');

        expect(collection.insertOne).toHaveBeenCalledTimes(1);
    });

    it('`setTransaction` should pass correct params', async () => {
        const tx = { blockHash: '', txHash: '' } as any as Transaction;
        const id = 'id';

        await dao.setTransaction(id, tx);

        expect(collection.updateMany).toHaveBeenCalledWith({ id }, { $set: { tx } });
        expect(collection.updateMany).toHaveBeenCalledTimes(1);
    });

    it('`setCronExpression` should pass correct params', async () => {
        const cronExpression = '* * * ? * * *';
        const id = 'id';

        await dao.setCronExpression(id, cronExpression);

        expect(collection.updateMany).toHaveBeenCalledWith({ id }, { $set: { cronExpression } });
        expect(collection.updateMany).toHaveBeenCalledTimes(1);
    });
});
