import * as config from 'config';
import { createHash } from 'crypto';
import { random } from 'lodash';
import { Db, MongoClient } from 'mongodb';
import { MongoContractDao } from '../../src/dao/mongodb/contract.dao';
import { ContractService } from '../../src/services/objects/contract.service';
import { CollectionMock, DbMock } from '../mock/db.mock';
import { getRandomAbi } from '../mock/helper';

describe('contract dao', () => {
    let dao: MongoContractDao;
    let collection: any;

    beforeAll(async () => {
        dao = new MongoContractDao(DbMock);
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

    it('getByAddress() transfers correct arguments', async () => {
        await dao.getByAddress('address');

        expect(collection.findOne).toHaveBeenCalledWith({ address: 'address' });
        expect(collection.findOne).toHaveBeenCalledTimes(1);
    });

    it('should create contract', async () => {
        await dao.createContract(
            'address',
            'abi'
        );

        expect(collection.insertOne).toHaveBeenCalledTimes(1);
    });

    it('should set abi', async () => {
        const abi = getRandomAbi();
        await dao.setAbi('id', abi);

        expect(collection.updateMany).toHaveBeenCalledWith(
            {
                id: 'id'
            },
            {
                $set: {
                    abi
                }
            }
        );
        expect(collection.updateMany).toHaveBeenCalledTimes(1);
    });
});
