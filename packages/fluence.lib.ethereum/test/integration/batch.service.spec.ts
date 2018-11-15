import { PluginManager } from '@applicature/core.plugin-manager';
import {
    ContractService,
    DaoCollectionNames,
    MongodbTransportConnectionDao,
    Scheme,
} from '@fluencesh/fluence.lib.services';
import * as config from 'config';
import * as cors from 'cors';
import * as express from 'express';
import { createServer, Server } from 'http';
import { Db, MongoClient } from 'mongodb';
import { promisify } from 'util';
import { BatchService } from '../../src/services/blockchain';
import { EthereumBlockchainService } from '../../src/services/blockchain';
import { ManagedEthereumTransportService } from '../../src/services/transports';
import { clearDb } from '../helper';

describe.skip('batch service', () => {
    let blockchainService: EthereumBlockchainService;
    let batchService: BatchService;
    let db: Db;
    let pluginManager: PluginManager;
    let contractService: ContractService;
    let randomContract: Scheme.ContractScheme = null;
    let clientServer: Server;

    const serverPort = 3000;
    const webhookUrl = `http://localhost:${serverPort}/webhook`;
    const webhookBodies: Array<Array<any>> = [];

    const BLOCKCHAIN_ID = 'ETH';
    const NETWORK_ID = 'rinkeby';

    async function initPluginManager() {
        pluginManager = new PluginManager([
            { path: '@applicature/core.mongodb' },
            { path: '@fluencesh/fluence.lib.services' },
        ]);

        await pluginManager.init();
    }

    async function initDb() {
        db = await MongoClient.connect(config.get('multivest.mongodb.url'), {});
    }

    async function createTransportConnections() {
        const transportConnections: Array<Scheme.TransportConnection> = [
            // {
            //     blockchainId: 'ETHEREUM',
            //     networkId: NETWORK_ID,
            //     providerId: 'json-rpc',
            //     settings: {
            //         url: 'http://127.0.0.1:8545'
            //     }
            // } as Scheme.TransportConnection,
            {
                blockchainId: 'ETHEREUM',
                networkId: NETWORK_ID,
                providerId: 'json-rpc',
                settings: {
                    url: 'http://127.0.0.1:8545/',
                },
                status: Scheme.TransportConnectionStatus.Enabled,
                isPrivate: false
            } as Scheme.TransportConnection
        ];

        const transportConnectionDao = new MongodbTransportConnectionDao(db);

        await Promise.all(transportConnections.map((tc) => transportConnectionDao.createTransportConnection(
            tc.blockchainId,
            tc.networkId,
            tc.providerId,
            tc.priority,
            tc.settings,
            tc.status,
            tc.isFailing,
            tc.lastFailedAt,
            tc.failedCount,
            tc.isPrivate,
            null
        )));
    }

    async function initBlockchainService() {
        const managedEthereumTransportService = new ManagedEthereumTransportService(pluginManager, NETWORK_ID);
        await managedEthereumTransportService.init();

        blockchainService = new EthereumBlockchainService(pluginManager, managedEthereumTransportService);
    }

    async function initBatchService() {
        batchService = new BatchService(pluginManager, blockchainService);
    }

    async function startClientServer() {
        const app = express();
        app.use(cors());
        app.use(express.json());
        app.post('/webhook', (req, res) => {
            webhookBodies.push(req.body);
            res.status(200).end();
        });

        clientServer = createServer(app);

        await promisify(clientServer.listen).call(clientServer, serverPort);
    }

    beforeAll(async () => {
        await initDb();
        await clearDb([
            ,
            DaoCollectionNames.Contract,
        ]);
        await initPluginManager();
        await createTransportConnections();
        await initBlockchainService();
        await initBatchService();

        await startClientServer();

        contractService = pluginManager.getServiceByClass(ContractService) as ContractService;
        const randomContractAbi = require('./data/random.contract.abi.json');
        const randomContractAddress = '0x85B887d535736080b235a5ea389C2CD256bD3744';
        randomContract = await contractService.createContract('project id', randomContractAddress, randomContractAbi);
    });

    afterAll(async () => {
        await new Promise((resolve, reject) => {
            clientServer.close((err: Error) => {
                if (err) {
                    return reject();
                }
                resolve();
            });
        });

        await db.close();
    });

    it.skip('should batch call contract\'s method (with input & multiply output)', async () => {
        const methodName = 'allOf';
        // tslint:disable-next-line:no-shadowed-variable
        const methodAbi = randomContract.abi.find((methodAbi) => methodAbi.name === methodName);

        const types = ['uint256'];
        const valuesData = [['1'], ['2'], ['3'], ['4'], ['5']];

        await batchService.contractMethodBatchCall(
            randomContract,
            methodName,
            types,
            valuesData,
            2,
            webhookUrl
        );

        webhookBodies.forEach((webhookBody: any, index) => {
            expect(webhookBody.done).toEqual((index + 1) === webhookBodies.length);

            webhookBody.results.forEach((result: any) => {
                methodAbi.outputs.forEach((output) => {
                    expect(typeof result[output.name] === 'string').toBeTruthy();
                });
            });
        });
    });
});
