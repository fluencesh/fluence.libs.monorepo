import * as config from 'config';
import { random } from 'lodash';
import { Db, MongoClient } from 'mongodb';
import { v1 as generateId } from 'uuid';
import { MongodbContractPublicRequestDao } from '../../src/dao/mongodb/contract.public.request.dao';
import { Scheme } from '../../src/types';
import { DaoCollectionNames, ContractPublicRequestService, MongoContractDao, ContractService } from '../../src';
import {
    clearCollections,
    createEntities,
    generateContractPublicRequest,
    getRandomItem,
    generateContract
} from '../helpers';
import 'jest-extended';

describe('Contract Public Request Service (integration)', () => {
    let mongoUrl: string;
    let connection: MongoClient;

    beforeAll(async () => {
        mongoUrl = config.get<string>('multivest.mongodb.url');
        connection = await MongoClient.connect(mongoUrl);
    });

    afterAll(async () => {
        await connection.close();
    });

    describe('Read operations', () => {
        let dbName: string;
        let db: Db;
        let service: ContractPublicRequestService;

        let requests: Array<Scheme.ContractPublicRequest>;
        let request: Scheme.ContractPublicRequest;

        beforeAll(async () => {
            dbName = config.get('multivest.mongodb.dbName') + 'ContractPublicRequestServiceRead';
            db = connection.db(dbName);

            const contractDao = new MongoContractDao(db);
            const contractService = new ContractService(null);
            (contractService as any).contractDao = contractDao;

            const dao = new MongodbContractPublicRequestDao(db);
            service = new ContractPublicRequestService(null);
            (service as any).contractPublicRequestDao = dao;
            (service as any).contractService = contractService;

            await clearCollections(db, [ DaoCollectionNames.ContractPublicRequest, DaoCollectionNames.Contract ]);

            requests = new Array(15);
            await createEntities(dao, generateContractPublicRequest, requests);
        });

        beforeEach(() => {
            request = getRandomItem(requests);
        });

        afterAll(async () => {
            if (config.has('tests.dropDbAfterTest') && config.get('tests.dropDbAfterTest')) {
                await db.dropDatabase();
            }
        });

        it('should get request by id', async () => {
            const got = await service.getById(request.id);
            expect(got).toEqual(request);
        });
    
        it('should get all requests', async () => {
            const got = await service.listAll();
            expect(got).toEqual(requests);
        });
    
        it('should get requests by client\'s id', async () => {
            const filtered = requests.filter((item) => item.clientId === request.clientId);
            const got = await service.listByClient(request.clientId);
            expect(got).toEqual(filtered);
        });
    
        it('should get requests by status', async () => {
            const filtered = requests.filter((req) => req.adminResolutionStatus === request.adminResolutionStatus);
            const got = await service.listByStatus(request.adminResolutionStatus);
            expect(got).toEqual(filtered);
        });
    
        it('should get requests by client id and status', async () => {
            const filtered = requests.filter((req) =>
                req.adminResolutionStatus === request.adminResolutionStatus
                && req.clientId === request.clientId
            );
            const got = await service.listByClientIdAndStatus(request.clientId, request.adminResolutionStatus);
    
            expect(got).toEqual(filtered);
        });
    
        it('should get unresolved requests', async () => {
            const filtered = requests.filter((req) => req.adminResolutionStatus === null);
            const got = await service.listUnresolvedRequests();
            expect(got).toEqual(filtered);
        });
    });

    describe('Create/Update operations', () => {
        let dbName: string;
        let db: Db;
        let service: ContractPublicRequestService;

        let requests: Array<Scheme.ContractPublicRequest>;
        let request: Scheme.ContractPublicRequest;

        beforeAll(async () => {
            dbName = config.get('multivest.mongodb.dbName') + 'ContractPublicRequestServiceCreateUpdate';
            db = connection.db(dbName);

            const contractDao = new MongoContractDao(db);
            const contractService = new ContractService(null);
            (contractService as any).contractDao = contractDao;

            const dao = new MongodbContractPublicRequestDao(db);
            service = new ContractPublicRequestService(null);
            (service as any).contractPublicRequestDao = dao;
            (service as any).contractService = contractService;

            await clearCollections(db, [ DaoCollectionNames.ContractPublicRequest, DaoCollectionNames.Contract ]);

            const contracts = new Array(10);
            await createEntities(contractDao, generateContract, contracts);

            requests = new Array(15);
            await createEntities(dao, () => {
                const data = generateContractPublicRequest();
                data.contractId = getRandomItem(contracts).id;
                return data;
            }, requests);
        });

        beforeEach(() => {
            request = getRandomItem(requests);
        });

        afterAll(async () => {
            if (config.has('tests.dropDbAfterTest') && config.get('tests.dropDbAfterTest')) {
                await db.dropDatabase();
            }
        });

        it('should create requests', async () => {
            const got = await service.createPublicContractRequest(
                request.clientId,
                request.contractId,
                request.description,
                false
            );

            expect(got.clientId).toEqual(request.clientId);
            expect(got.contractId).toEqual(request.contractId);
            expect(got.description).toEqual(request.description);
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

            await service.setResolution(
                request.id,
                request.adminId,
                request.adminResolution,
                request.adminResolutionStatus
            );

            const got = await service.getById(request.id);

            expect(got.adminId).toEqual(request.adminId);
            expect(got.adminResolution).toEqual(request.adminResolution);
            expect(got.adminResolutionStatus).toEqual(request.adminResolutionStatus);
        });
    });
});
