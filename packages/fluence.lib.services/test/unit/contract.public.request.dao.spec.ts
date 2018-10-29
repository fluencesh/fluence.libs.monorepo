import * as config from 'config';
import { omit, random } from 'lodash';
import { Db, MongoClient } from 'mongodb';
import { v1 as generateId } from 'uuid';
import { MongodbContractPublicRequestDao } from '../../src/dao/mongodb/contract.public.request.dao';
import { Scheme } from '../../src/types';
import { randomContractPublicRequest } from '../helper';
import { CollectionMock, DbMock } from '../mock/db.mock';

describe('contract public request dao', () => {
    let dao: MongodbContractPublicRequestDao;
    let collection: any;

    beforeAll(async () => {
        dao = new MongodbContractPublicRequestDao(DbMock);
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

    it('listAll() transfers correct arguments', async () => {
        const got = await dao.listAll();
        
        expect(collection.find).toHaveBeenCalledWith({});
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('listByClient() transfers correct arguments', async () => {
        const clientId = 'clientId';

        const got = await dao.listByClient(clientId);
        
        expect(collection.find).toHaveBeenCalledWith({ clientId });
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('listByStatus() transfers correct arguments', async () => {
        const status = 'status' as any;

        const got = await dao.listByStatus(status);
        
        expect(collection.find).toHaveBeenCalledWith({ adminResolutionStatus: status });
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('listByClientIdAndStatus() transfers correct arguments', async () => {
        const status = 'status' as any;
        const clientId = 'clientId';

        const got = await dao.listByClientIdAndStatus(clientId, status);
        
        expect(collection.find).toHaveBeenCalledWith({
            clientId,
            adminResolutionStatus: status
        });
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('listUnresolvedRequests() transfers correct arguments', async () => {
        const got = await dao.listUnresolvedRequests();
        
        expect(collection.find).toHaveBeenCalledWith({
            adminId: null,
            adminResolution: null,
            adminResolutionStatus: null
        });
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('createPublicContractRequest() transfers correct arguments', async () => {
        await dao.createPublicContractRequest(
            'clientId',
            'contractId',
            'desc'
        );

        expect(collection.insertOne).toHaveBeenCalledTimes(1);
    });

    it('setResolution() transfers correct arguments', async () => {
        const req = {
            id: 'id',
            adminId: 'adminId',
            adminResolution: '',
            adminResolutionStatus: '' as any
        } as Scheme.ContractPublicRequest;

        await dao.setResolution(
            req.id,
            req.adminId,
            req.adminResolution,
            req.adminResolutionStatus
        );

        expect(collection.updateMany).toHaveBeenCalledWith(
            {
                id: req.id
            },
            {
                $set: omit(req, 'id')
            }
        );
        expect(collection.updateMany).toHaveBeenCalledTimes(1);
    });
});
