import * as config from 'config';
import { random } from 'lodash';
import { Db, MongoClient } from 'mongodb';
import { v1 as generateId } from 'uuid';
import { ContractService, MongoContractDao } from '../../index';
import { MongodbContractPublicRequestDao } from '../../src/dao/mongodb/contract.public.request.dao';
import { ContractPublicRequestService } from '../../src/services/object/contract.public.request.service';
import { Scheme } from '../../src/types';
import { randomContract, randomContractPublicRequest } from '../helper';

describe('contract public request service', () => {
    let connection: Db;
    
    let reqDao: MongodbContractPublicRequestDao;
    const requests: Array<Scheme.ContractPublicRequest> = [];
    const requestsCount = 15;
    let request: Scheme.ContractPublicRequest;

    let contractDao: MongoContractDao;
    const contracts: Array<Scheme.ContractScheme> = [];
    const contractsCount: number = 15;
    let contract: Scheme.ContractScheme;

    let contractPublicRequestService: ContractPublicRequestService;
    let contractService: ContractService;

    beforeAll(async () => {
        connection = await MongoClient.connect(config.get('multivest.mongodb.url'), {});

        contractDao = new MongoContractDao(connection);
        for (let i = 0; i < requestsCount; i++) {
            contracts.push(await contractDao.create(randomContract()));
        }

        reqDao = new MongodbContractPublicRequestDao(connection);
        for (let i = 0; i < requestsCount; i++) {
            const randomReq = randomContractPublicRequest();

            randomReq.contractId = contracts[random(0, requestsCount - 1)].id;

            requests.push(await reqDao.create(randomReq));
        }

        contractService = new ContractService(null);
        (contractService as any).contractDao = contractDao;

        contractPublicRequestService = new ContractPublicRequestService(null);
        (contractPublicRequestService as any).contractPublicRequestDao = reqDao;
        (contractPublicRequestService as any).contractService = contractService;
    });

    beforeEach(() => {
        request = requests[random(0, requestsCount - 1)];
        contract = contracts[random(0, contractsCount - 1)];
    });

    afterAll(async () => {
        await connection.db('multivest').collection('contractPublicRequests').remove({});
        await connection.db('multivest').collection('contracts').remove({});

        connection.close();
    });

    it('should get request by id', async () => {
        const got = await contractPublicRequestService.getById(request.id);

        expect(got).toEqual(request);
    });

    it('should get all requests', async () => {
        const got = await contractPublicRequestService.listAll();

        expect(got).toEqual(requests);
    });

    it('should get requests by client\'s id', async () => {
        const got = await contractPublicRequestService.listByClient(request.clientId);

        expect(got).toEqual([ request ]);
    });

    it('should get requests by status', async () => {
        const filtered = requests.filter((req) => req.adminResolutionStatus === request.adminResolutionStatus);
        const got = await contractPublicRequestService.listByStatus(request.adminResolutionStatus);

        expect(got).toEqual(filtered);
    });

    it('should get requests by client id and status', async () => {
        const filtered = requests.filter((req) =>
            req.adminResolutionStatus === request.adminResolutionStatus
            && req.clientId === request.clientId
        );
        const got = await contractPublicRequestService.listByClientIdAndStatus(
            request.clientId,
            request.adminResolutionStatus
        );

        expect(got).toEqual(filtered);
    });

    it('should get unresolved requests', async () => {
        const filtered = requests.filter((req) => req.adminResolutionStatus === null);
        const got = await contractPublicRequestService.listUnresolvedRequests();

        expect(got).toEqual(filtered);
    });

    it('should create requests', async () => {
        const randomReq = randomContractPublicRequest();
        const notFabricContract = contracts.find((c) => !c.isFabric);

        randomReq.contractId = notFabricContract.id;

        notFabricContract.isFabric = !notFabricContract.isFabric;

        const got = await contractPublicRequestService.createPublicContractRequest(
            randomReq.clientId,
            randomReq.contractId,
            randomReq.description,
            notFabricContract.isFabric
        );

        expect(got.clientId).toEqual(randomReq.clientId);
        expect(got.contractId).toEqual(randomReq.contractId);
        expect(got.description).toEqual(randomReq.description);
        expect(got.adminId).toEqual(null);
        expect(got.adminResolution).toEqual(null);
        expect(got.adminResolutionStatus).toEqual(null);

        const patchedContract = await contractService.getById(notFabricContract.id);

        expect(patchedContract.isFabric).toBeTruthy();
    });

    it('should set admin\'s resolution', async () => {
        const notPublicContracts = contracts.filter((c) => !c.isPublic);

        // tslint:disable-next-line:no-shadowed-variable
        const req = requests.find((req) => {
            const relatedContract = contracts.find((c) => req.contractId === c.id);

            return !relatedContract.isPublic;
        });

        req.adminId = generateId();
        req.adminResolution = 'adminResolution';
        req.adminResolutionStatus = Scheme.AdminResolutionStatus.APPROVE;

        await contractPublicRequestService.setResolution(
            req.id,
            req.adminId,
            req.adminResolution,
            req.adminResolutionStatus
        );

        const got = await contractPublicRequestService.getById(req.id);

        expect(got).toEqual(req);

        const publicContract = await contractService.getById(req.contractId);

        expect(publicContract.isPublic).toBeTruthy();
    });
});
