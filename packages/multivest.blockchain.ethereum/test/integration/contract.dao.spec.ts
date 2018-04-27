import * as config from 'config';
import { createHash } from 'crypto';
import { random } from 'lodash';
import { Db, MongoClient } from 'mongodb';
import { v1 as generateId } from 'uuid';
import { MongoContractDao } from '../../src/dao/mongodb/contract.dao';
import { ContractService } from '../../src/services/objects/contract.service';
import { ContractScheme } from '../../src/types';
import { randomContract } from '../helper';
import { getRandomAbi } from '../mock/helper';

describe('transport connection service', () => {
    let service: ContractService;
    let dao: MongoContractDao;
    const contracts: Array<ContractScheme> = [];
    const contractsCount: number = 15;
    let contract: ContractScheme;
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

    it('should get contract by address', async () => {
        const got = await dao.getByAddress(contract.address);

        expect(got).toEqual(contract);
    });

    it('should create contract', async () => {
        const someContract = randomContract();

        const created = await dao.createContract(
            someContract.address,
            someContract.abi
        );

        const got = await dao.getById(created.id);

        expect(got).toEqual(created);
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
