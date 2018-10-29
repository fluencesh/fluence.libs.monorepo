import * as config from 'config';
import { random } from 'lodash';
import { Db, MongoClient } from 'mongodb';
import { v1 as generateId } from 'uuid';
import { MongodbContractPublicRequestDao } from '../../src/dao/mongodb/contract.public.request.dao';
import { Scheme } from '../../src/types';
import { randomContractPublicRequest } from '../helper';

describe('contract public request dao', () => {
    let dao: MongodbContractPublicRequestDao;
    let connection: Db;
    const requests: Array<Scheme.ContractPublicRequest> = [];
    const requestsCount = 15;
    let request: Scheme.ContractPublicRequest;

    beforeAll(async () => {
        connection = await MongoClient.connect(config.get('multivest.mongodb.url'), {w: 1});
        dao = new MongodbContractPublicRequestDao(connection);

        await dao.remove({});

        for (let i = 0; i < requestsCount; i++) {
            requests.push(await dao.create(randomContractPublicRequest()));
        }
    });

    beforeEach(() => {
        request = requests[random(0, requestsCount - 1)];
    });

    afterAll(async () => {
        await dao.remove({});

        await connection.close();
    });

    it('should get request by id', async () => {
        const got = await dao.getById(request.id);
        expect(got).toEqual(request);
    });

    it('should get all requests', async () => {
        const got = await dao.listAll();
        expect(got).toEqual(requests);
    });

    it('should get requests by client\'s id', async () => {
        const got = await dao.listByClient(request.clientId);
        expect(got).toEqual([ request ]);
    });

    it('should get requests by status', async () => {
        const filtered = requests.filter((req) => req.adminResolutionStatus === request.adminResolutionStatus);
        const got = await dao.listByStatus(request.adminResolutionStatus);
        expect(got).toEqual(filtered);
    });

    it('should get requests by client id and status', async () => {
        const filtered = requests.filter((req) =>
            req.adminResolutionStatus === request.adminResolutionStatus
            && req.clientId === request.clientId
        );
        const got = await dao.listByClientIdAndStatus(request.clientId, request.adminResolutionStatus);

        expect(got).toEqual(filtered);
    });

    it('should get unresolved requests', async () => {
        const filtered = requests.filter((req) => req.adminResolutionStatus === null);
        const got = await dao.listUnresolvedRequests();
        expect(got).toEqual(filtered);
    });

    it('should create requests', async () => {
        const randomReq = randomContractPublicRequest();

        const got = await dao.createPublicContractRequest(
            randomReq.clientId,
            randomReq.contractId,
            randomReq.description
        );

        expect(got.clientId).toEqual(randomReq.clientId);
        expect(got.contractId).toEqual(randomReq.contractId);
        expect(got.description).toEqual(randomReq.description);
        expect(got.adminId).toEqual(null);
        expect(got.adminResolution).toEqual(null);
        expect(got.adminResolutionStatus).toEqual(null);
    });

    it('should set admin\'s resolution', async () => {
        request.adminId = generateId();
        request.adminResolution = 'adminResolution';
        request.adminResolutionStatus = random(0, 1)
            ? Scheme.AdminResolutionStatus.APPROVE
            : Scheme.AdminResolutionStatus.DISAPPROVE;

        await dao.setResolution(
            request.id,
            request.adminId,
            request.adminResolution,
            request.adminResolutionStatus
        );

        const got = await dao.getById(request.id);

        expect(got).toEqual(request);
    });
});
