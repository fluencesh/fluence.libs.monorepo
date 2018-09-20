import { MongodbPrometheusMetricDao } from '../../src';
import { generateRandomPrometheusMetric } from '../helper';
import { CollectionMock, DbMock } from '../mock/db.mock';

describe('prometheus metric', () => {
    let dao: MongodbPrometheusMetricDao;
    let collection: any;

    beforeAll(async () => {
        dao = new MongodbPrometheusMetricDao(DbMock);
        collection = CollectionMock as any;
    });

    beforeEach(() => {
        Object.keys(collection).forEach((key) => {
            const spy = collection[key] as jest.SpyInstance;
            spy.mockClear();
        });
    });

    it('getById() transfers correct arguments', async () => {
        const id = 'id';
        await dao.getById(id);

        expect(collection.findOne).toHaveBeenCalledWith({ id });
        expect(collection.findOne).toHaveBeenCalledTimes(1);
    });

    it('listAll() transfers correct arguments', async () => {
        await dao.listAll();

        expect(collection.find).toHaveBeenCalledWith({});
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('createMetric() transfers correct arguments', async () => {
        const name = 'name';
        const value = 0;
        await dao.createMetric(name, value);

        expect(collection.insertOne).toHaveBeenCalledTimes(1);
    });

    it('incrementMetricValue() transfers correct arguments', async () => {
        const incrementOn = 5;
        const id = 'id';
        await dao.incrementMetricValue(id, incrementOn);
        
        expect(collection.updateMany).toHaveBeenCalledWith({ id }, {
            $inc: {
                value: incrementOn
            }
        });
        expect(collection.updateMany).toHaveBeenCalledTimes(1);
    });

    it('setMetricValue() transfers correct arguments', async () => {
        const value = 5;
        const id = 'id';
        await dao.setMetricValue(id, value);

        expect(collection.updateMany).toHaveBeenCalledWith({ id }, {
            $set: {
                value
            }
        });
        expect(collection.updateMany).toHaveBeenCalledTimes(1);
    });

    it('resetMetricsByIds() transfers correct arguments', async () => {
        const ids = ['id'];
        await dao.resetMetricsByIds(ids);

        expect(collection.updateMany).toHaveBeenCalledWith({
            id: {
                $in: ids
            }
        }, {
            $set: {
                value: 0
            }
        });
        expect(collection.updateMany).toHaveBeenCalledTimes(1);
    });

    it('removeMetric() transfers correct arguments', async () => {
        const id = 'id';
        await dao.removeMetric(id);

        expect(collection.deleteMany).toHaveBeenCalledWith({ id });
        expect(collection.deleteMany).toHaveBeenCalledTimes(1);
    });
});
