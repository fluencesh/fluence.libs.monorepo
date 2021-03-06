import { Plugin as MongodbPlugin } from '@applicature/synth.mongodb';
import { Plugin } from '@applicature/synth.plugin-manager';
import {
    MongoContractDao,
    MongodbAddressSubscriptionDao,
    MongodbClientDao,
    MongodbContractPublicRequestDao,
    MongodbEthereumContractSubscriptionDao,
    MongodbEthereumEventLogDao,
    MongodbJobDao,
    MongodbOraclizeSubscriptionDao,
    MongodbProjectBlockchainSetupDao,
    MongodbProjectDao,
    MongodbScheduledTxDao,
    MongodbSessionDao,
    MongodbSubscriptionBlockRecheckDao,
    MongodbTransactionDao,
    MongodbTransactionHashSubscriptionDao,
    MongodbTransportConnectionDao,
    MongodbTransportConnectionSubscriptionDao,
    MongodbWebhookActionDao,
    MongodbFabricContractCreationSubscriptionDao,
} from './dao';
import {
    AddressSubscriptionService,
    BlockchainRegistryService,
    ClientService,
    ContractPublicRequestService,
    ContractService,
    EthereumContractSubscriptionService,
    EthereumEventLogService,
    JobService,
    OraclizeSubscriptionService,
    ProjectBlockchainSetupService,
    ProjectService,
    ScheduledTxService,
    SessionService,
    SubscriptionBlockRecheckService,
    TransactionHashSubscriptionService,
    TransactionService,
    TransportConnectionService,
    TransportConnectionSubscriptionService,
    WebhookActionItemObjectService,
    WebhookCallerService,
    FabricContractCreationSubscriptionService,
} from './services';

class BlockchainServicesPlugin extends Plugin<void> {
    public getPluginId() {
        return 'services.blockchain';
    }

    public async init() {
        const mongoDbPlugin = this.pluginManager.get('mongodb') as any as MongodbPlugin;

        mongoDbPlugin.addDao(MongodbAddressSubscriptionDao);
        mongoDbPlugin.addDao(MongodbClientDao);
        mongoDbPlugin.addDao(MongodbJobDao);
        mongoDbPlugin.addDao(MongodbOraclizeSubscriptionDao);
        mongoDbPlugin.addDao(MongodbProjectDao);
        mongoDbPlugin.addDao(MongodbTransactionDao);
        mongoDbPlugin.addDao(MongodbTransactionHashSubscriptionDao);
        mongoDbPlugin.addDao(MongodbTransportConnectionDao);
        mongoDbPlugin.addDao(MongodbWebhookActionDao);
        mongoDbPlugin.addDao(MongoContractDao);
        mongoDbPlugin.addDao(MongodbEthereumContractSubscriptionDao);
        mongoDbPlugin.addDao(MongodbEthereumEventLogDao);
        mongoDbPlugin.addDao(MongodbContractPublicRequestDao);
        mongoDbPlugin.addDao(MongodbScheduledTxDao);
        mongoDbPlugin.addDao(MongodbProjectBlockchainSetupDao);
        mongoDbPlugin.addDao(MongodbSessionDao);
        mongoDbPlugin.addDao(MongodbSubscriptionBlockRecheckDao);
        mongoDbPlugin.addDao(MongodbTransportConnectionSubscriptionDao);
        mongoDbPlugin.addDao(MongodbFabricContractCreationSubscriptionDao);

        this.registerService(AddressSubscriptionService);
        this.registerService(BlockchainRegistryService);
        this.registerService(ClientService);
        this.registerService(JobService);
        this.registerService(OraclizeSubscriptionService);
        this.registerService(ProjectService);
        this.registerService(TransactionService);
        this.registerService(TransactionHashSubscriptionService);
        this.registerService(TransportConnectionService);
        this.registerService(WebhookActionItemObjectService);
        this.registerService(WebhookCallerService);
        this.registerService(ContractService);
        this.registerService(EthereumContractSubscriptionService);
        this.registerService(EthereumEventLogService);
        this.registerService(ContractPublicRequestService);
        this.registerService(ProjectBlockchainSetupService);
        this.registerService(SessionService);
        this.registerService(SubscriptionBlockRecheckService);
        this.registerService(ScheduledTxService);
        this.registerService(TransportConnectionSubscriptionService);
        this.registerService(FabricContractCreationSubscriptionService);
    }
}

export { BlockchainServicesPlugin as Plugin };
