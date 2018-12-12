import { MongodbJobDao } from '../../src/dao/mongodb/job.dao';
import { CollectionMock, DbMock } from '../mock/db.mock';

describe('Job DAO (unit)', () => {
    let dao: MongodbJobDao;
    let collection: any;

    beforeAll(async () => {
        dao = new MongodbJobDao(DbMock);
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

    it('setParams() transfers correct arguments', async () => {
        await dao.setParams('id', {
            processedBlockHeight: 1000,
            processedBlockTime: 10000
        });

        expect(collection.updateMany).toHaveBeenCalledWith(
            {
                id: 'id'
            },
            {
                $set: {
                    params: {
                        processedBlockHeight: 1000,
                        processedBlockTime: 10000
                    }
                }
            }
        );
        expect(collection.updateMany).toHaveBeenCalledTimes(1);
    });

});
