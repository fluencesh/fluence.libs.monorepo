import * as config from 'config';
import { Db, MongoClient } from 'mongodb';
import { MongoContractDao } from '../../src/dao/mongodb/contract.dao';
import { Scheme } from '../../src/types';
import { DaoCollectionNames } from '../../src';
import { clearCollections, createEntities, generateContract, getRandomItem, getRandomAbi } from '../helpers';

describe('Contract DAO (integration)', () => {
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
        let dao: MongoContractDao;

        let contracts: Array<Scheme.ContractScheme>;
        let contract: Scheme.ContractScheme;

        beforeAll(async () => {
            dbName = config.get('multivest.mongodb.dbName') + 'ContractRead';
            db = connection.db(dbName);
            dao = new MongoContractDao(db);

            await clearCollections(db, [ DaoCollectionNames.Contract ]);

            contracts = new Array(15);
            await createEntities(dao, generateContract, contracts);
        });

        beforeEach(() => {
            contract = getRandomItem(contracts);
        });

        afterAll(async () => {
            if (config.has('tests.dropDbAfterTest') && config.get('tests.dropDbAfterTest')) {
                await db.dropDatabase();
            }
        });

        it('should get contract by id', async () => {
            const got = await dao.getById(contract.id);
            expect(got).toEqual(contract);
        });
    
        it('should get contract by id and projectId', async () => {
            const got = await dao.getByIdAndProjectId(contract.id, contract.projectId);
            expect(got).toEqual(contract);
        });
    
        it('should get contract by address', async () => {
            const got = await dao.getByAddress(contract.address);
            expect(got).toEqual(contract);
        });
    
        it('should get contract by address and projectId', async () => {
            const got = await dao.getByAddressAndProjectId(contract.address, contract.projectId);
            expect(got).toEqual(contract);
        });
    
        it('should get list of contracts by fabric status and projectId', async () => {
            const filtered = contracts.filter((c) => c.isFabric === contract.isFabric);
            const got = await dao.listByFabricStatus(contract.isFabric);
            expect(got).toEqual(filtered);
        });
    
        it('should get list of contracts by public status and projectId', async () => {
            const filtered = contracts.filter((c) => c.isPublic === contract.isPublic);
            const got = await dao.listByPublicStatus(contract.isPublic);
            expect(got).toEqual(filtered);
        });
    
        it('should get list of contracts by ids', async () => {
            const filtered = contracts.filter((c, index) => index < 5);
            const got = await dao.listByIds(filtered.map((c) => c.id));
            expect(got).toEqual(filtered);
        });
    
        it('should get list of contracts by addresses', async () => {
            const filtered = contracts.filter((c) => contract.address === c.address);
            const got = await dao.listByAddresses(filtered.map((c) => c.address));
            expect(got).toEqual(filtered);
        });
    });

    describe('Create/Update operations', () => {
        let dbName: string;
        let db: Db;
        let dao: MongoContractDao;

        let contracts: Array<Scheme.ContractScheme>;
        let contract: Scheme.ContractScheme;

        beforeAll(async () => {
            dbName = config.get('multivest.mongodb.dbName') + 'ContractCreateUpdate';
            db = connection.db(dbName);
            dao = new MongoContractDao(db);

            await clearCollections(db, [ DaoCollectionNames.Contract ]);

            contracts = new Array(15);
            await createEntities(dao, generateContract, contracts);
        });

        beforeEach(() => {
            contract = getRandomItem(contracts);
        });

        afterAll(async () => {
            if (config.has('tests.dropDbAfterTest') && config.get('tests.dropDbAfterTest')) {
                await db.dropDatabase();
            }
        });

        it('should create contract', async () => {
            const someContract = generateContract();
    
            const created = await dao.createContract(
                someContract.projectId,
                someContract.address,
                someContract.abi
            );
            
            expect(created.abi).toEqual(someContract.abi);
            expect(created.address).toEqual(someContract.address);
            expect(created.projectId).toEqual(someContract.projectId);
            expect(created.isFabric).toEqual(false);
            expect(created.isPublic).toEqual(false);
        });
    
        it('should set abi', async () => {
            const newAbi = getRandomAbi();
    
            await dao.setAbi(
                contract.id,
                newAbi
            );
    
            const got = await dao.getById(contract.id);
    
            expect(got.abi).toEqual(newAbi);
        });
    
        it('should mark contract as fabric', async () => {
            await dao.markAsFabric(contract.id);
    
            const got = await dao.getById(contract.id);
            expect(got.isFabric).toEqual(true);
        });
    
        it('should mark contract as public', async () => {
            await dao.markAsPublic(contract.id);
            const got = await dao.getById(contract.id);
            expect(got.isPublic).toEqual(true);
        });
    });
});
