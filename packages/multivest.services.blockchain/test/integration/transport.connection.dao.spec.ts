import * as config from 'config';
import { random } from 'lodash';
import { Db, MongoClient } from 'mongodb';
import { v1 as generateId } from 'uuid';
import { MongodbTransportConnectionDao } from '../../src/dao/mongodb/transport.connection.dao';
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
        await connection.db('multivest').collection('transportConnections').remove({});

        connection.close();
    });

    it('should get transport connection by id', async () => {
        const got = await dao.getById(transportConnection.id);

        expect(got).toEqual(transportConnection);
    });

    it('should get transport connection by network, blockchain id and providerId', async () => {
        const got = await dao.getByBlockchainIdAndNetworkIdAndProviderId(
            transportConnection.blockchainId,
            transportConnection.networkId,
            transportConnection.providerId
        );

        expect(got).toEqual(transportConnection);
    });

    it('should get transport connection by network and blockchain id', async () => {
        const filtered = transportConnections.filter((tc) => {
            return tc.blockchainId === transportConnection.blockchainId
                && tc.networkId === transportConnection.networkId;
        });

        const got = await dao.listByBlockchainAndNetwork(
            transportConnection.blockchainId,
            transportConnection.networkId
        );

        expect(got).toEqual(filtered);
    });

    it('should get transport connection by network and blockchain id and status', async () => {
        const filtered = transportConnections.filter((tc) => {
            return tc.blockchainId === transportConnection.blockchainId
                && tc.networkId === transportConnection.networkId
                && tc.status === transportConnection.status;
        });

        const got = await dao.listByBlockchainAndNetworkAndStatus(
            transportConnection.blockchainId,
            transportConnection.networkId,
            transportConnection.status
        );

        expect(got).toEqual(filtered);
    });

    it('should get transport connection by network and blockchain id and status', async () => {
        const filtered = transportConnections.filter((tc) => {
            return tc.blockchainId === transportConnection.blockchainId
                && tc.networkId === transportConnection.networkId
                && tc.isPredefinedBySystem === transportConnection.isPredefinedBySystem;
        });

        const got = await dao.listByIsPredefinedStatusAndBlockchainInfo(
            transportConnection.isPredefinedBySystem,
            transportConnection.blockchainId,
            transportConnection.networkId
        );

        expect(got).toEqual(filtered);
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
            data.failedCount,

            data.isPrivate
        );

        const got = await dao.getById(created.id);

        expect(got).toEqual(created);
    });

    it('should set new settings', async () => {
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

    it('should set new status by ids', async () => {
        transportConnection.status = transportConnection.status === Scheme.TransportConnectionStatus.Enabled
            ? Scheme.TransportConnectionStatus.Disabled
            : Scheme.TransportConnectionStatus.Enabled;

        await dao.setStatusByIds(
            [ transportConnection.id ],
            transportConnection.status
        );

        const got = await dao.getById(transportConnection.id);

        expect(got.status).toEqual(transportConnection.status);
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

    it('should set new failed status by blockchain ids', async () => {
        transportConnection.isFailing = !transportConnection.isFailing;
        transportConnection.lastFailedAt = transportConnection.isFailing
            ? new Date()
            : null;

        await dao.setFailedByIds(
            [ transportConnection.id ],
            transportConnection.isFailing,
            transportConnection.lastFailedAt
        );

        const got = await dao.getById(transportConnection.id);

        expect(got).toEqual(transportConnection);
    });

    it('should remove transport connections by id', async () => {
        await dao.removeById(transportConnection.id);

        const got = await dao.getById(transportConnection.id);
        expect(got).toBeNull();

        transportConnections.splice(transportConnections.indexOf(got), 1);
    });

    it('should remove transport connections by ids', async () => {
        const howManyToRemove = 3;
        const transportConnectionToRemove = transportConnections.filter((tc, index) => index < howManyToRemove);
        const idsToRemove = transportConnectionToRemove.map((tc) => tc.id);

        await dao.removeByIds(idsToRemove);

        const got = await Promise.all(idsToRemove.map((id) => dao.getById(id)));
        got.forEach((tc) => {
            expect(tc).toBeNull();
        });

        transportConnections.splice(0, howManyToRemove);
    });
});
