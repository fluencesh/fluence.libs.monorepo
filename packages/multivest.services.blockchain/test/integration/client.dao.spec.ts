import * as config from 'config';
import { Db, MongoClient } from 'mongodb';
import { MongodbClientDao } from '../../src/dao/mongodb/client.dao';
import { Scheme } from '../../src/types';

import { omit, random } from 'lodash';
import { v1 as generateId } from 'uuid';

import { randomClient } from '../helper';

describe('address subscription dao', () => {
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

    it('should get by ethereum address', async () => {
        const got = await dao.getByEthereumAddress(client.ethereumAddress);

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

    it('should create new client', async () => {
        const data = randomClient();
        const got = await dao.createClient(data.ethereumAddress, data.status, data.isAdmin);

        const incomparableFields = ['createdAt', '_id', 'id'];
        expect(omit(got, incomparableFields)).toEqual(omit(data, incomparableFields));
    });
});
