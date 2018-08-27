import * as config from 'config';
import { Db, MongoClient } from 'mongodb';
import { MongodbClientDao } from '../../src/dao/mongodb/client.dao';
import { Scheme } from '../../src/types';

import { omit, random } from 'lodash';
import { v1 as generateId } from 'uuid';

import { randomClient } from '../helper';

describe('client dao', () => {
    let dao: MongodbClientDao;
    const clients: Array<Scheme.Client> = [];
    const clientsCount = 15;
    let client: Scheme.Client;
    let connection: Db;

    beforeAll(async () => {
        connection = await MongoClient.connect(config.get('multivest.mongodb.url'), {});
        dao = new MongodbClientDao(connection);
        dao.remove({});

        for (let i = 0; i < clientsCount; i++) {
            clients.push(await dao.create(randomClient()));
        }
    });

    beforeEach(() => {
        client = clients[random(0, clientsCount - 1)];
    });

    afterAll(async () => {
        await connection.db('multivest').collection('clients').remove({});

        connection.close();
    });

    it('should get by id', async () => {
        const got = await dao.getById(client.id);

        expect(got).toEqual(client);
    });

    it('should get by email', async () => {
        const got = await dao.getByEmail(client.email);

        expect(got).toEqual(client);
    });

    it('should get by email and password hash', async () => {
        const got = await dao.getByEmailAndPasswordHash(client.email, client.passwordHash);

        expect(got).toEqual(client);
    });

    it('should set status', async () => {
        client.status = client.status === Scheme.ClientStatus.Active
            ? Scheme.ClientStatus.Inactive
            : Scheme.ClientStatus.Active;

        await dao.setStatus(client.id, client.status);
        const got = await dao.getById(client.id);

        expect(got).toEqual(client);
    });

    it('should set verification status', async () => {
        const isVerified = !client.isVerified;

        await dao.setVerificationStatus(client.id, isVerified);
        const got = await dao.getById(client.id);

        expect(got.isVerified).toEqual(isVerified);

        client.isVerified = isVerified;
    });

    it('should create new client', async () => {
        const data = randomClient();
        const got = await dao.createClient(data.email, data.passwordHash, data.isAdmin);

        expect(got.email).toEqual(data.email);
        expect(got.passwordHash).toEqual(data.passwordHash);
        expect(got.isAdmin).toEqual(data.isAdmin);

        clients.push(got);
    });
});
