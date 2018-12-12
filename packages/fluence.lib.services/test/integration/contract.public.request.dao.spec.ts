import * as config from 'config';
import { random } from 'lodash';
import { Db, MongoClient } from 'mongodb';
import { v1 as generateId } from 'uuid';
import { MongodbContractPublicRequestDao } from '../../src/dao/mongodb/contract.public.request.dao';
import { Scheme } from '../../src/types';
import { DaoCollectionNames } from '../../src';
import { clearCollections, createEntities, generateContractPublicRequest, getRandomItem } from '../helpers';
import 'jest-extended';

describe('Contract Public Request DAO (integration)', () => {
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
        let dao: MongodbContractPublicRequestDao;

        let requests: Array<Scheme.ContractPublicRequest>;
        let request: Scheme.ContractPublicRequest;

        beforeAll(async () => {
            dbName = config.get('multivest.mongodb.dbName') + 'ContractPublicRequestDaoRead';
            db = connection.db(dbName);
            dao = new MongodbContractPublicRequestDao(db);

            await clearCollections(db, [ DaoCollectionNames.ContractPublicRequest ]);

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
            const got = await dao.getById(request.id);
            expect(got).toEqual(request);
        });
    
        it('should get all requests', async () => {
            const got = await dao.listAll();
            expect(got).toEqual(requests);
        });
    
        it('should get requests by client\'s id', async () => {
            const filtered = requests.filter((item) => item.clientId === request.clientId);
            const got = await dao.listByClient(request.clientId);
            expect(got).toEqual(filtered);
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
    });

    describe('Create/Update operations', () => {
        let dbName: string;
        let db: Db;
        let dao: MongodbContractPublicRequestDao;

        let requests: Array<Scheme.ContractPublicRequest>;
        let request: Scheme.ContractPublicRequest;

        beforeAll(async () => {
            dbName = config.get('multivest.mongodb.dbName') + 'ContractPublicRequestDaoCreateUpdate';
            db = connection.db(dbName);
            dao = new MongodbContractPublicRequestDao(db);

            await clearCollections(db, [ DaoCollectionNames.ContractPublicRequest ]);

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

        it('should create requests', async () => {
            const randomReq = generateContractPublicRequest();

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

            expect(got.adminId).toEqual(request.adminId);
            expect(got.adminResolution).toEqual(request.adminResolution);
            expect(got.adminResolutionStatus).toEqual(request.adminResolutionStatus);
        });
    });
});
