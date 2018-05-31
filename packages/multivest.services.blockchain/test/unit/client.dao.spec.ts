import * as config from 'config';
import { random } from 'lodash';
import { Db, MongoClient } from 'mongodb';
import { MongodbClientDao } from '../../src/dao/mongodb/client.dao';
import { Scheme } from '../../src/types';
import { randomClient } from '../helper';
import { CollectionMock, DbMock } from '../mock/db.mock';

describe('client dao', () => {
    let dao: MongodbClientDao;
    let collection: any;

    beforeAll(async () => {
        dao = new MongodbClientDao(DbMock);
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

    it('getByEthereumAddress() transfers correct arguments', async () => {
        const got = await dao.getByEthereumAddress('ethereumAddress');

        expect(collection.findOne).toHaveBeenCalledWith({ ethereumAddress: 'ethereumAddress' });
        expect(collection.findOne).toHaveBeenCalledTimes(1);
    });

    it('setStatus() transfers correct arguments', async () => {
        await dao.setStatus('id', 'active' as any);

        expect(collection.updateMany).toHaveBeenCalledWith(
            {
                id: 'id'
            },
            {
                $set: {
                    status: 'active'
                },
            }
        );
        expect(collection.updateMany).toHaveBeenCalledTimes(1);
    });

    it('createClient() transfers correct arguments', async () => {
        const data = randomClient();
        await dao.createClient(data.ethereumAddress, data.status, data.isAdmin);

        expect(collection.insertOne).toHaveBeenCalledTimes(1);
    });
});
