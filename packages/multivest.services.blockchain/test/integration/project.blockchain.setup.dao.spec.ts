import * as config from 'config';
import { Db, MongoClient } from 'mongodb';
import { MongodbProjectBlockchainSetupDao } from '../../src/dao/mongodb';
import { Scheme } from '../../src/types';

import { omit, random } from 'lodash';

import { randomProjectBlockchainSetup } from '../helper';

describe('setup dao', () => {
    let dao: MongodbProjectBlockchainSetupDao;
    const setups: Array<Scheme.ProjectBlockchainSetup> = [];
    const setupsCount = 15;
    let setup: Scheme.ProjectBlockchainSetup;
    let connection: Db;

    beforeAll(async () => {
        connection = await MongoClient.connect(config.get('multivest.mongodb.url'), {});
        dao = new MongodbProjectBlockchainSetupDao(connection);
        dao.remove({});

        for (let i = 0; i < setupsCount; i++) {
            setups.push(await dao.create(randomProjectBlockchainSetup()));
        }
    });

    beforeEach(() => {
        setup = setups[random(0, setups.length - 1)];
    });

    afterAll(async () => {
        await connection.db('multivest').collection('setups').remove({});

        connection.close();
    });

    it('should get by id', async () => {
        const got = await dao.getById(setup.id);

        expect(got).toEqual(setup);
    });

    it('should get by id and project id', async () => {
        const got = await dao.getByIdAndProjectId(setup.id, setup.projectId);

        expect(got).toEqual(setup);
    });

    it('should get by transport connection id and project id', async () => {
        const got = await dao.getByTransportConnectionIdAndProjectId(
            setup.privateTransportConnectionId,
            setup.projectId
        );

        expect(got).toEqual(setup);
    });

    it('should get list by project id', async () => {
        const filtered = setups.filter((s) => s.projectId === setup.projectId);
        const got = await dao.listByProjectId(setup.projectId);

        expect(got).toEqual(filtered);
    });

    it('should get list by project id and blockchain id', async () => {
        const filtered = setups.filter((s) => s.projectId === setup.projectId && s.blockchainId === setup.blockchainId);
        const got = await dao.listByProjectIdAndBlockchainId(setup.projectId, setup.blockchainId);

        expect(got).toEqual(filtered);
    });

    it('should create new setup', async () => {
        const data = randomProjectBlockchainSetup();
        const got = await dao.createSetup(data.projectId, data.blockchainId, data.privateTransportConnectionId);

        expect(got.projectId).toEqual(data.projectId);
        expect(got.blockchainId).toEqual(data.blockchainId);
        expect(got.privateTransportConnectionId).toEqual(data.privateTransportConnectionId);
    });

    it('should set status of setup', async () => {
        const status = setup.status === Scheme.ProjectBlockchainSetupStatus.Disabled
            ? Scheme.ProjectBlockchainSetupStatus.Enabled
            : Scheme.ProjectBlockchainSetupStatus.Disabled;

        await dao.setStatus(setup.id, status);

        const got = await dao.getById(setup.id);
        expect(got.status).toEqual(status);
        
        setup.status = status;
    });

    it('should set status of setup by project id', async () => {
        const status = setup.status === Scheme.ProjectBlockchainSetupStatus.Disabled
            ? Scheme.ProjectBlockchainSetupStatus.Enabled
            : Scheme.ProjectBlockchainSetupStatus.Disabled;

        const filtered = setups.filter((s) => s.projectId === setup.projectId);

        await dao.setStatusByProjectId(setup.projectId, status);

        const got = await dao.listByProjectId(setup.projectId);
        // tslint:disable-next-line:no-shadowed-variable
        got.forEach((setup) => {
            expect(setup.status).toEqual(status);
        });

        // tslint:disable-next-line:no-shadowed-variable
        filtered.forEach((setup) => {
            setup.status = status;
        });
    });

    it('should remove setup by id', async () => {
        await dao.removeById(setup.id);

        const got = await dao.getById(setup.id);
        expect(got).toBeNull();

        setups.splice(setups.indexOf(setup), 1);
    });

    it('should remove setup by projectId', async () => {
        await dao.removeByProjectId(setup.projectId);

        const got = await dao.listByProjectId(setup.projectId);
        expect(got.length).toEqual(0);

        setups
            .filter((s) => s.projectId === setup.projectId)
            // tslint:disable-next-line:no-shadowed-variable
            .forEach((setup, index, setups) => setups.splice(index, 1));
    });
});
