import * as config from 'config';
import { random } from 'lodash';
import { Db, MongoClient } from 'mongodb';
import { v1 as generateId } from 'uuid';
import { MongodbTransportConnectionDao } from '../../src/dao/mongodb/transport.connection.dao';
import { randomJob } from '../../src/generation/jobs';
import { Scheme } from '../../src/types';
import { randomTransportConnection } from '../helper';

describe('transport connection dao', () => {
    let dao: MongodbTransportConnectionDao;
    const transportConnections: Array<Scheme.TransportConnection> = [];
    const transportConnectionsCount: number = 15;
    let transportConnection: Scheme.TransportConnection;
    let connection: Db;

    beforeAll(async () => {
        connection = await MongoClient.connect(config.get('multivest.mongodb.url'), {});
        dao = new MongodbTransportConnectionDao(connection);
        dao.remove({});

        for (let i = 0; i < transportConnectionsCount; i++) {
            transportConnections.push(await dao.create(randomTransportConnection()));
        }
    });

    beforeEach(() => {
        transportConnection = transportConnections[random(0, transportConnectionsCount - 1)];
    });

    afterAll(async () => {
        connection.close();
    });

    it('should get job by id', async () => {
        const got = await dao.getById(transportConnection.id);

        expect(got).toEqual(transportConnection);
    });

    it('should create new transport connection', async () => {
        const data = randomTransportConnection();

        const created = await dao.createTransportConnection(
            data.blockchainId,
            data.networkId,
            data.providerId,

            data.priority,

            data.settings,

            data.status,

            data.isFailing,
            data.lastFailedAt,
            data.failedCount
        );

        const got = await dao.getById(created.id);

        expect(got).toEqual(created);
    });

    it('should set new status', async () => {
        transportConnection.settings = { [generateId()]: generateId() };

        await dao.setSettings(
            transportConnection.id,
            transportConnection.settings
        );

        const got = await dao.getById(transportConnection.id);

        expect(got).toEqual(transportConnection);
    });

    it('should set new status', async () => {
        transportConnection.status = transportConnection.status === Scheme.TransportConnectionStatus.Enabled
            ? Scheme.TransportConnectionStatus.Disabled
            : Scheme.TransportConnectionStatus.Enabled;

        await dao.setStatus(
            transportConnection.id,
            transportConnection.status
        );

        const got = await dao.getById(transportConnection.id);

        expect(got).toEqual(transportConnection);
    });

    it('should set new failed status', async () => {
        transportConnection.isFailing = !transportConnection.isFailing;
        transportConnection.lastFailedAt = transportConnection.isFailing
            ? new Date()
            : null;

        await dao.setFailed(
            transportConnection.id,
            transportConnection.isFailing,
            transportConnection.lastFailedAt
        );

        const got = await dao.getById(transportConnection.id);

        expect(got).toEqual(transportConnection);
    });
});
