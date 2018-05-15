import * as config from 'config';
import { createHash } from 'crypto';
import { random, get } from 'lodash';
import { Db, MongoClient } from 'mongodb';
import { v1 as generateId } from 'uuid';
import { MongoContractDao } from '../../src/dao/mongodb/contract.dao';
import { ContractService } from '../../src/services/object/contract.service';
import { Scheme } from '../../src/types';
import { randomContract } from '../helper';
import { getRandomAbi } from '../helper';

describe('transport connection service', () => {
    let service: ContractService;
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

        service = new ContractService(null);
        (service as any).contractDao = dao;
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

    it('should create contract', async () => {
        const someContract = randomContract();

        const created = await dao.createContract(
            someContract.projectId,
            someContract.address,
            someContract.abi
        );

        Object.keys(someContract).forEach((key) => {
            const srcVal = get(someContract, key);
            const createdVal = get(created, key);
            expect(srcVal).toEqual(createdVal);
        });
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
});
