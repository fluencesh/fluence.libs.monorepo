import {
    AddressSubscriptionBlockChainListener,
    AddressSubscriptionService,
    JobService,
    MongodbTransportConnectionDao,
    ProjectService,
    Scheme,
    WebhookActionItemObjectService,
    WebhookCaller,
    WebhookCallerService,
} from '@applicature-restricted/multivest.services.blockchain';
import { Block, PluginManager } from '@applicature/multivest.core';
import * as Agenda from 'agenda';
import { json } from 'body-parser';
import * as config from 'config';
import * as express from 'express';
import { Db, MongoClient } from 'mongodb';
import { EthereumBlockchainService } from '../../src/services/blockchain/ethereum';
import { ManagedEthereumTransportService } from '../../src/services/blockchain/managed.ethereum.transport.service';

describe('address subscription', () => {
    const sinceBlock: number = 2143395;
    const minConfirmation = 0;
    const BLOCKCHAIN_ID = 'ETHEREUM';
    const NETWORK_ID = 'rinkeby';

    let subscriptionServiceListener: AddressSubscriptionBlockChainListener;
    let subscriptionService: AddressSubscriptionService;
    let webhookCaller: WebhookCaller;
    let pluginManager: PluginManager;
    let blockchainService: EthereumBlockchainService;
    let connection: Db;
    let jobService: JobService;
    let agenda: Agenda;
    let block: Block;
    let app: express.Application;
    let webhookBodies: Array<any>;

    const webhookSettings = {
        host: 'localhost',
        port: 3000,
        endpoint: '/webhook',
        get webhookUrl(): string {
            return `http://${this.host}:${this.port}${this.endpoint}`;
        }
    };
    let project: Scheme.Project = {
        clientId: 'client.id',
        name: 'project',
        status: Scheme.ProjectStatus.Active,
        webhookUrl: webhookSettings.webhookUrl,
    } as Scheme.Project;
    let addressSubscription: Scheme.AddressSubscription = {
        clientId: project.clientId,
        blockChainId: BLOCKCHAIN_ID,
        networkId: NETWORK_ID,
        minConfirmations: 0,
        subscribed: true,
        isProjectActive: true,
        isClientActive: true,
    } as Scheme.AddressSubscription;

    async function initPluginManager() {
        pluginManager = new PluginManager([
            { path: '@applicature/multivest.mongodb' },
            { path: '@applicature-restricted/multivest.services.blockchain' },
        ]);

        await Promise.all([
            startAgenda(),
            pluginManager.init()
        ]);

        pluginManager.setJobExecutor(agenda);
    }

    async function initTransportConnections() {
        const transportConnections: Array<Scheme.TransportConnection> = [
            {
                blockchainId: BLOCKCHAIN_ID,
                networkId: NETWORK_ID,
                providerId: 'json-rpc',
                settings: {
                    url: 'https://rinkeby.infura.io/bXMBS9zEadMgfXd0Y3G1',
                }
            } as Scheme.TransportConnection
        ];

        const transportConnectionDao = new MongodbTransportConnectionDao(connection);

        await Promise.all(transportConnections.map((tc) => transportConnectionDao.createTransportConnection(
            tc.blockchainId,
            tc.networkId,
            tc.providerId,
            tc.priority,
            tc.settings,
            tc.status,
            tc.isFailing,
            tc.lastFailedAt,
            tc.failedCount
        )));
    }

    async function initSubscriptionListener() {
        const managedEthereumTransportService = new ManagedEthereumTransportService(pluginManager, NETWORK_ID);

        await managedEthereumTransportService.init();

        blockchainService = new EthereumBlockchainService(pluginManager, managedEthereumTransportService);

        jobService = pluginManager.getServiceByClass(JobService) as JobService;

        subscriptionServiceListener = new AddressSubscriptionBlockChainListener(
            pluginManager,
            blockchainService,
            jobService,
            sinceBlock,
            minConfirmation,
            sinceBlock
        );
    }

    async function initWebhookCaller() {
        webhookCaller = new WebhookCaller(pluginManager);
    }

    async function createProject() {
        const projectService = pluginManager.getServiceByClass(ProjectService) as ProjectService;

        project = await projectService.createProject(
            project.clientId,
            project.name,
            project.webhookUrl,
            project.sharedSecret,
            project.status
        );
        
        addressSubscription.projectId = project.id;
    }

    async function createSubscription() {
        block = await blockchainService.getBlockByHeight(sinceBlock);

        const address = block
            .transactions
            .find((tx) => !!tx.to[0].address)
            .to[0].address;

        addressSubscription.address = address;

        subscriptionService = pluginManager.getServiceByClass(AddressSubscriptionService) as AddressSubscriptionService;

        addressSubscription = await subscriptionService.createSubscription(
            addressSubscription.clientId,
            addressSubscription.projectId,
            addressSubscription.blockChainId,
            addressSubscription.networkId,
            addressSubscription.address,
            addressSubscription.minConfirmations,
            addressSubscription.subscribed,
            addressSubscription.isProjectActive,
            addressSubscription.isClientActive
        );
    }

    async function startClientServer() {
        app = express();

        app.use(json());

        app.post(webhookSettings.endpoint, (req, res) => {
            webhookBodies.push(req.body);

            res.end();
        });

        await new Promise((resolve, reject) => {
            app.listen(webhookSettings.port, (err) => {
                if (err) {
                    return reject();
                }
                resolve();
            });
        });
    }

    function startAgenda(): Promise<Agenda> {
        return new Promise((resolve, reject) => {
            agenda = new Agenda(
                {
                    db: { address: config.get('multivest.mongodb.url') },
                }
            );

            agenda.on('ready', () => {
                resolve();
            });
        });
    }

    beforeAll(async () => {
        connection = await MongoClient.connect(config.get('multivest.mongodb.url'), {});

        await initPluginManager();
        await initTransportConnections();
        await createProject();
        await initSubscriptionListener();
        await initWebhookCaller();
        await createSubscription();
        await startClientServer();

        agenda.start();
    }, 15000);

    beforeEach(() => {
        webhookBodies = [];
    });

    afterAll(async () => {
        const db = await connection.db('multivest');

        await Promise.all(
            [
                'transportConnections', 'addressSubscriptions', 'jobs', 'webhooks'
            ].map((table) => db.collection(table).remove({}))
        );

        await connection.close();

        process.exit(0);
    });

    it.skip('should create webhooks action items', async () => {
        await new Promise((resolve, reject) => {
            const getBlockHeight = blockchainService.getBlockHeight;
            blockchainService.getBlockHeight = () => Promise.resolve(sinceBlock + 2);

            const jobId = subscriptionServiceListener.getJobId();

            agenda.now(jobId);

            agenda.on(`complete:${jobId}`, (job) => {
                blockchainService.getBlockHeight = getBlockHeight;
                resolve();
            });
        });
    });

    it('should work', async () => {
        await new Promise((resolve, reject) => {
            const getBlockHeight = blockchainService.getBlockHeight;
            blockchainService.getBlockHeight = () => Promise.resolve(sinceBlock + 2);

            const jobId = subscriptionServiceListener.getJobId();

            agenda.now(jobId);

            agenda.on(`complete:${jobId}`, (job) => {
                blockchainService.getBlockHeight = getBlockHeight;
                resolve();
            });
        });

        await new Promise((resolve, reject) => {
            const jobId = webhookCaller.getJobId();
            
            agenda.now(jobId);

            agenda.on(`complete:${jobId}`, (job) => {
                resolve();
            });
        });

        expect(webhookBodies).toBeInstanceOf(Array);
        expect(webhookBodies.length).toEqual(1);

        webhookBodies.forEach((body) => {
            expect(body.address).toEqual(addressSubscription.address);
            expect(body.blockChainId).toEqual(addressSubscription.blockChainId);
            expect(body.networkId).toEqual(addressSubscription.networkId);
            expect(typeof body.blockHash === 'string').toBeTruthy();
            expect(body.blockHeight).toEqual(sinceBlock + 1);
            expect(typeof body.blockTime === 'number').toBeTruthy();
            expect(typeof body.confirmations === 'number').toBeTruthy();
            expect(typeof body.minConfirmations === 'number').toBeTruthy();
            expect(body.params.amount).toBeTruthy(); // FIXME: should be converted into number/string
            expect(typeof body.refId === 'string').toBeTruthy();
            expect(typeof body.txHash === 'string').toBeTruthy();
            expect(typeof body.type === 'string').toBeTruthy();
        });
    }, 20000); // 20sec
});
