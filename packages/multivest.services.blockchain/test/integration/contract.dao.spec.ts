import * as config from 'config';
import { createHash } from 'crypto';
import { get, random } from 'lodash';
import { Db, MongoClient } from 'mongodb';
import { v1 as generateId } from 'uuid';
import { MongoContractDao } from '../../src/dao/mongodb/contract.dao';
import { Scheme } from '../../src/types';
import { randomContract } from '../helper';
import { getRandomAbi } from '../helper';

describe('contract dao', () => {
    let dao: MongoContractDao;
    const contracts: Array<Scheme.ContractScheme> = [];
    const contractsCount: number = 15;
    let contract: Scheme.ContractScheme;
    let connection: Db;

    beforeAll(async () => {
        connection = await MongoClient.connect(config.get('multivest.mongodb.url'), {});
        dao = new MongoContractDao(connection);
        dao.remove({});

        for (let i = 0; i < contractsCount; i++) {
            contracts.push(await dao.create(randomContract()));
        }
    });

    beforeEach(() => {
        contract = contracts[random(0, contractsCount - 1)];
    });

    afterAll(async () => {
        connection.close();
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

    it('should create contract', async () => {
        const someContract = randomContract();

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
        // tslint:disable-next-line:no-shadowed-variable
        const contract = randomContract();
        const created = await dao.createContract(contract.projectId, contract.address, contract.abi);

        await dao.markAsFabric(created.id);

        const got = await dao.getById(created.id);
        expect(got.isFabric).toEqual(true);
    });

    it('should mark contract as public', async () => {
        // tslint:disable-next-line:no-shadowed-variable
        const contract = randomContract();
        const created = await dao.createContract(contract.projectId, contract.address, contract.abi);

        await dao.markAsPublic(created.id);

        const got = await dao.getById(created.id);
        expect(got.isPublic).toEqual(true);
    });
});
