import {
    Scheme,
    MongodbTransportConnectionSubscriptionDao
} from '../../src';
import {
    generatePipeline,
    generatePipelineForStatusCheck
} from '../transport.connection.subscription.helper';
import { CollectionMock, DbMock } from '../mock/db.mock';

describe('transport connection subscription dao spec', () => {
    let dao: MongodbTransportConnectionSubscriptionDao;
    let collection: any;

    beforeAll(async () => {
        dao = new MongodbTransportConnectionSubscriptionDao(DbMock);
        collection = CollectionMock as any;
    });

    beforeEach(() => {
        Object.keys(collection).forEach((key) => {
            const spy = collection[key] as jest.SpyInstance;
            spy.mockClear();
        });
    });

    it('should return transport connection with related subscriptions by ID', async () => {
        const transportConnectionId = 'transportConnectionId';
        await dao.getById(transportConnectionId);

        expect(collection.aggregate).toHaveBeenCalledTimes(1);
        expect(collection.aggregate).toHaveBeenCalledWith(
            generatePipeline({ id: transportConnectionId }),
            { allowDiskUse: true }
        );
    });

    it('should return transport connection with related subscriptions by ID and status (active)', async () => {
        const transportConnectionId = 'transportConnectionId';
        const status = Scheme.TransportConnectionSubscriptionStatus.Subscribed;
        dao.getByIdAndStatus(
            transportConnectionId,
            status
        );

        expect(collection.aggregate).toHaveBeenCalledTimes(1);
        expect(collection.aggregate).toHaveBeenCalledWith(
            generatePipelineForStatusCheck(status, { id: transportConnectionId }),
            { allowDiskUse: true }
        );
    });

    it('should return transport connection with related subscriptions by ID and status (inactive)', async () => {
        const transportConnectionId = 'transportConnectionId';
        const status = Scheme.TransportConnectionSubscriptionStatus.Unsubscribed;
        await dao.getByIdAndStatus(
            transportConnectionId,
            status
        );

        expect(collection.aggregate).toHaveBeenCalledTimes(1);
        expect(collection.aggregate).toHaveBeenCalledWith(
            generatePipelineForStatusCheck(status, { id: transportConnectionId }),
            { allowDiskUse: true }
        );
    });

    it('should return list of transport connections with related subscriptions', async () => {
        await dao.list();
        
        expect(collection.aggregate).toHaveBeenCalledTimes(1);
        expect(collection.aggregate).toHaveBeenCalledWith(generatePipeline(), { allowDiskUse: true });
    });

    it('should return list of transport connections with related subscriptions by status (active)', async () => {
        const status = Scheme.TransportConnectionSubscriptionStatus.Subscribed;
        await dao.listByStatus(status);
        
        expect(collection.aggregate).toHaveBeenCalledTimes(1);
        expect(collection.aggregate).toHaveBeenCalledWith(
            generatePipelineForStatusCheck(status),
            { allowDiskUse: true }
        );
    });

    it('should return list of transport connections with related subscriptions by status (inactive)', async () => {
        const status = Scheme.TransportConnectionSubscriptionStatus.Unsubscribed;
        await dao.listByStatus(status);
        
        expect(collection.aggregate).toHaveBeenCalledTimes(1);
        expect(collection.aggregate).toHaveBeenCalledWith(
            generatePipelineForStatusCheck(status),
            { allowDiskUse: true }
        );
    });

    it('should return transport connections with related subscriptions by IDs', async () => {
        const transportConnectionIds = [ 'transportConnectionId' ];
        await dao.listByIds(transportConnectionIds);
        
        expect(collection.aggregate).toHaveBeenCalledTimes(1);
        expect(collection.aggregate).toHaveBeenCalledWith(
            generatePipeline({
                id: {
                    $in: transportConnectionIds
                }
            }),
            { allowDiskUse: true }
        );
    });

    it('should return transport connections with related subscriptions by IDs and status (active)', async () => {
        const transportConnectionIds = [ 'transportConnectionId' ];
        const status = Scheme.TransportConnectionSubscriptionStatus.Subscribed;
        await dao.listByIdsAndStatus(transportConnectionIds, status);
        
        expect(collection.aggregate).toHaveBeenCalledTimes(1);
        expect(collection.aggregate).toHaveBeenCalledWith(
            generatePipelineForStatusCheck(status, {
                id: {
                    $in: transportConnectionIds
                }
            }),
            { allowDiskUse: true }
        );
    });

    it('should return transport connections with related subscriptions by IDs and status (inactive)', async () => {
        const transportConnectionIds = [ 'transportConnectionId' ];
        const status = Scheme.TransportConnectionSubscriptionStatus.Unsubscribed;
        await dao.listByIdsAndStatus(transportConnectionIds, status);
        
        expect(collection.aggregate).toHaveBeenCalledTimes(1);
        expect(collection.aggregate).toHaveBeenCalledWith(
            generatePipelineForStatusCheck(status, {
                id: {
                    $in: transportConnectionIds
                }
            }),
            { allowDiskUse: true }
        );
    });

    it('should return transport connections with related subscriptions by blockchainId and networkId', async () => {
        const blockchainId = 'blockchainId';
        const networkId = 'networkId';
        await dao.listByBlockchainInfo(
            blockchainId,
            networkId
        );
        
        expect(collection.aggregate).toHaveBeenCalledTimes(1);
        expect(collection.aggregate).toHaveBeenCalledWith(
            generatePipeline({ blockchainId, networkId }),
            { allowDiskUse: true }
        );
    });

    it('should return tc with related subscriptions by blockchainId, networkId and status (active)', async () => {
        const blockchainId = 'blockchainId';
        const networkId = 'networkId';
        const status = Scheme.TransportConnectionSubscriptionStatus.Subscribed;
        await dao.listByStatusAndBlockchainInfo(
            status,
            blockchainId,
            networkId
        );
        
        expect(collection.aggregate).toHaveBeenCalledTimes(1);
        expect(collection.aggregate).toHaveBeenCalledWith(
            generatePipelineForStatusCheck(status, {
                blockchainId,
                networkId
            }),
            { allowDiskUse: true }
        );
    });

    it('should return tc with related subscriptions by blockchainId, networkId and status (inactive)', async () => {
        const blockchainId = 'blockchainId';
        const networkId = 'networkId';
        const status = Scheme.TransportConnectionSubscriptionStatus.Unsubscribed;
        await dao.listByStatusAndBlockchainInfo(
            status,
            blockchainId,
            networkId
        );
        
        expect(collection.aggregate).toHaveBeenCalledTimes(1);
        expect(collection.aggregate).toHaveBeenCalledWith(
            generatePipelineForStatusCheck(status, {
                blockchainId,
                networkId
            }),
            { allowDiskUse: true }
        );
    });
});
