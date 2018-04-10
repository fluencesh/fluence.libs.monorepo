import * as config from 'config';
import { random } from 'lodash';
import { Db, MongoClient } from 'mongodb';
import { v1 as generateId } from 'uuid';
import { MongodbTransportConnectionDao } from '../../src/dao/mongodb/transport.connection.dao';
import { randomJob } from '../../src/generation/jobs';
import { TransportConnectionService } from '../../src/services/object/transport.connection.service';
import { Scheme } from '../../src/types';
import { randomTransportConnection } from '../helper';

describe('transport connection service', () => {
    let service: TransportConnectionService;
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

        service = new TransportConnectionService(null);
        (service as any).transportConnectionDao = dao;
    });

    beforeEach(() => {
        transportConnection = transportConnections[random(0, transportConnectionsCount - 1)];
    });

    afterAll(async () => {
        connection.close();
    });

    it('should get transport connection by id', async () => {
        const got = await service.getById(transportConnection.id);

        expect(got).toEqual(transportConnection);
    });

    it('should get transport connection by network and blockchain ids', async () => {
        const filtered = transportConnections.filter((tc) => {
            return tc.blockchainId === transportConnection.blockchainId
                && tc.networkId === transportConnection.networkId;
        });

        const got = await service.listByBlockchainAndNetwork(
            transportConnection.blockchainId,
            transportConnection.networkId
        );

        expect(got).toEqual(filtered);
    });

    it('should create new transport connection', async () => {
        const data = randomTransportConnection();

        const created = await service.createTransportConnection(
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

        const got = await service.getById(created.id);

        expect(got).toEqual(created);
    });

    it('should set new status', async () => {
        transportConnection.settings = { [generateId()]: generateId() };

        await service.setSettings(
            transportConnection.id,
            transportConnection.settings
        );

        const got = await service.getById(transportConnection.id);

        expect(got).toEqual(transportConnection);
    });

    it('should set new status', async () => {
        transportConnection.status = transportConnection.status === Scheme.TransportConnectionStatus.Enabled
            ? Scheme.TransportConnectionStatus.Disabled
            : Scheme.TransportConnectionStatus.Enabled;

        await service.setStatus(
            transportConnection.id,
            transportConnection.status
        );

        const got = await service.getById(transportConnection.id);

        expect(got).toEqual(transportConnection);
    });

    it('should set new failed status', async () => {
        transportConnection.isFailing = !transportConnection.isFailing;
        transportConnection.lastFailedAt = transportConnection.isFailing
            ? new Date()
            : null;

        await service.setFailed(
            transportConnection.id,
            transportConnection.isFailing,
            transportConnection.lastFailedAt
        );

        const got = await service.getById(transportConnection.id);

        expect(got).toEqual(transportConnection);
    });

    it('should set new failed status by blockchain ids', async () => {
        transportConnection.isFailing = !transportConnection.isFailing;
        transportConnection.lastFailedAt = transportConnection.isFailing
            ? new Date()
            : null;

        await service.setFailedByIds(
            [ transportConnection.id ],
            transportConnection.isFailing,
            transportConnection.lastFailedAt
        );

        const got = await service.getById(transportConnection.id);

        expect(got).toEqual(transportConnection);
    });
});
