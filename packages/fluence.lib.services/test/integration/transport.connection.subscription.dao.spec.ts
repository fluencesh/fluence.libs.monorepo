import { PluginManager } from '@applicature/core.plugin-manager';
import { resolve } from 'path';
import {
    clearDb,
    createEntities,
    randomTransportConnection,
    randomOraclize,
    getRandomItem,
    randomTransactionSubscription,
    randomEthereumContractSubscription,
    randomAddressSubscription
} from '../helper';
import {
    DaoCollectionNames,
    OraclizeSubscriptionDao,
    TransactionHashSubscriptionDao,
    EthereumContractSubscriptionDao,
    AddressSubscriptionDao,
    TransportConnectionDao,
    DaoIds,
    Scheme,
    TransportConnectionSubscriptionDao
} from '../../src';
import {
    compareTcs,
    convertTcsByStatus,
    compareTcsArrays,
    convertListOfTcsByStatus
} from '../transport.connection.subscription.helper';

describe('transport connection subscription dao spec', () => {
    let dao: TransportConnectionSubscriptionDao;
    const transportConnectionSubscriptions: Array<Scheme.TransportConnectionSubscription> = [];
    let transportConnectionSubscription: Scheme.TransportConnectionSubscription = null;

    beforeAll(async () => {
        const pluginManager = new PluginManager([
            { path: '@applicature/core.mongodb' },
            { path: resolve(__dirname, '../../') }
        ]);

        await pluginManager.init();

        await clearDb([
            DaoCollectionNames.TransportConnection,
            DaoCollectionNames.Oraclize,
            DaoCollectionNames.TransactionHashSubscription,
            DaoCollectionNames.EthereumContractSubscription,
            DaoCollectionNames.AddressSubscription,
        ]);

        dao = pluginManager.getDao(DaoIds.TransportConnectionSubscription) as TransportConnectionSubscriptionDao;

        const transportConnectionDao: TransportConnectionDao =
            pluginManager.getDao(DaoIds.TransportConnection) as TransportConnectionDao;
        const oraclizeDao: OraclizeSubscriptionDao = pluginManager.getDao(DaoIds.Oraclize) as OraclizeSubscriptionDao;
        const txHashSubscriptionDao: TransactionHashSubscriptionDao =
            pluginManager.getDao(DaoIds.TransactionHashSubscription) as TransactionHashSubscriptionDao;
        const contractSubscriptionDao: EthereumContractSubscriptionDao =
            pluginManager.getDao(DaoIds.EthereumContractSubscription) as EthereumContractSubscriptionDao;
        const addressSubscriptionDao: AddressSubscriptionDao =
            pluginManager.getDao(DaoIds.AddressSubscription) as AddressSubscriptionDao;

        const transportConnections: Array<Scheme.TransportConnection> = new Array(5);
        const oraclizeSubscriptions: Array<Scheme.OraclizeSubscription> = new Array(15);
        const txHashSubscriptions: Array<Scheme.TransactionHashSubscription> = new Array(15);
        const contractSubscriptions: Array<Scheme.EthereumContractSubscription> = new Array(15);
        const addressSubscriptions: Array<Scheme.AddressSubscription> = new Array(15);

        await createEntities(transportConnectionDao, randomTransportConnection, transportConnections);

        await Promise.all([
            createEntities(
                oraclizeDao,
                () => {
                    const data = randomOraclize();
                    data.transportConnectionId = getRandomItem(transportConnections).id;
                    return data;
                },
                oraclizeSubscriptions
            ),
            createEntities(
                txHashSubscriptionDao,
                () => {
                    const data = randomTransactionSubscription();
                    data.transportConnectionId = getRandomItem(transportConnections).id;
                    return data;
                },
                txHashSubscriptions
            ),
            createEntities(
                contractSubscriptionDao,
                () => {
                    const data = randomEthereumContractSubscription();
                    data.transportConnectionId = getRandomItem(transportConnections).id;
                    return data;
                },
                contractSubscriptions
            ),
            createEntities(
                addressSubscriptionDao,
                () => {
                    const data = randomAddressSubscription();
                    data.transportConnectionId = getRandomItem(transportConnections).id;
                    return data;
                },
                addressSubscriptions
            ),
        ]);

        for (const transportConnection of transportConnections) {
            // tslint:disable-next-line:no-shadowed-variable
            const transportConnectionSubscription = transportConnection as Scheme.TransportConnectionSubscription;

            transportConnectionSubscription.addressSubscriptions =
                addressSubscriptions.filter((s) => s.transportConnectionId === transportConnectionSubscription.id);
            transportConnectionSubscription.contractSubscriptions =
                contractSubscriptions.filter((s) => s.transportConnectionId === transportConnectionSubscription.id);
            transportConnectionSubscription.oraclizeSubscriptions =
                oraclizeSubscriptions.filter((s) => s.transportConnectionId === transportConnectionSubscription.id);
            transportConnectionSubscription.transactionHashSubscriptions =
                txHashSubscriptions.filter((s) => s.transportConnectionId === transportConnectionSubscription.id);

            transportConnectionSubscriptions.push(transportConnectionSubscription);
        }

    });

    beforeEach(() => {
        transportConnectionSubscription = getRandomItem(transportConnectionSubscriptions);
    });

    it('should return transport connection with related subscriptions by ID', async () => {
        const got = await dao.getById(transportConnectionSubscription.id);
        compareTcs(got, transportConnectionSubscription);
    });

    it('should return transport connection with related subscriptions by ID and status (active)', async () => {
        const status = Scheme.TransportConnectionSubscriptionStatus.Subscribed;
        const got = await dao.getByIdAndStatus(
            transportConnectionSubscription.id,
            status
        );

        compareTcs(got, convertTcsByStatus(transportConnectionSubscription, status));
    });

    it('should return transport connection with related subscriptions by ID and status (inactive)', async () => {
        const status = Scheme.TransportConnectionSubscriptionStatus.Unsubscribed;
        const got = await dao.getByIdAndStatus(
            transportConnectionSubscription.id,
            status
        );
        compareTcs(got, convertTcsByStatus(transportConnectionSubscription, status));
    });

    it('should return list of transport connections with related subscriptions', async () => {
        const got = await dao.list();
        compareTcsArrays(got, transportConnectionSubscriptions);
    });

    it('should return list of transport connections with related subscriptions by status (active)', async () => {
        const status = Scheme.TransportConnectionSubscriptionStatus.Subscribed;
        const got = await dao.listByStatus(status);
        compareTcsArrays(got, convertListOfTcsByStatus(transportConnectionSubscriptions, status));
    });

    it('should return list of transport connections with related subscriptions by status (inactive)', async () => {
        const status = Scheme.TransportConnectionSubscriptionStatus.Unsubscribed;
        const got = await dao.listByStatus(status);
        compareTcsArrays(got, convertListOfTcsByStatus(transportConnectionSubscriptions, status));
    });

    it('should return transport connections with related subscriptions by IDs', async () => {
        const got = await dao.listByIds([transportConnectionSubscription.id]);
        compareTcsArrays(got, [ transportConnectionSubscription ]);
    });

    it('should return transport connections with related subscriptions by IDs and status (active)', async () => {
        const status = Scheme.TransportConnectionSubscriptionStatus.Subscribed;
        const got = await dao.listByIdsAndStatus([ transportConnectionSubscription.id ], status);
        compareTcsArrays(got, convertListOfTcsByStatus([ transportConnectionSubscription ], status));
    });

    it('should return transport connections with related subscriptions by IDs and status (inactive)', async () => {
        const status = Scheme.TransportConnectionSubscriptionStatus.Unsubscribed;
        const got = await dao.listByIdsAndStatus([ transportConnectionSubscription.id ], status);
        compareTcsArrays(got, convertListOfTcsByStatus([ transportConnectionSubscription ], status));
    });

    it('should return transport connections with related subscriptions by blockchainId and networkId', async () => {
        const got = await dao.listByBlockchainInfo(
            transportConnectionSubscription.blockchainId,
            transportConnectionSubscription.networkId
        );
        compareTcsArrays(got, [ transportConnectionSubscription ]);
    });

    it('should return tc with related subscriptions by blockchainId, networkId and status (active)', async () => {
        const status = Scheme.TransportConnectionSubscriptionStatus.Subscribed;
        const got = await dao.listByStatusAndBlockchainInfo(
            status,
            transportConnectionSubscription.blockchainId,
            transportConnectionSubscription.networkId
        );
        compareTcsArrays(got, convertListOfTcsByStatus([ transportConnectionSubscription ], status));
    });

    it('should return tc with related subscriptions by blockchainId, networkId and status (inactive)', async () => {
        const status = Scheme.TransportConnectionSubscriptionStatus.Unsubscribed;
        const got = await dao.listByStatusAndBlockchainInfo(
            status,
            transportConnectionSubscription.blockchainId,
            transportConnectionSubscription.networkId
        );
        compareTcsArrays(got, convertListOfTcsByStatus([ transportConnectionSubscription ], status));
    });
});
