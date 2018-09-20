import { Plugin } from '@fluencesh/multivest.core';
import { Plugin as MongodbPlugin } from '@fluencesh/multivest.mongodb';

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
    MongodbPrometheusMetricDao,
    MongodbScheduledTxDao,
    MongodbSessionDao,
    MongodbSubscriptionBlockRecheckDao,
    MongodbTransactionDao,
    MongodbTransactionHashSubscriptionDao,
    MongodbTransportConnectionDao,
    MongodbWebhookActionDao,
} from './dao';
import {
    AddressSubscriptionService,
    AwsMetricService,
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
    PrometheusMetricService,
    SessionService,
    SubscriptionBlockRecheckService,
    TransactionHashSubscriptionService,
    TransactionService,
    TransportConnectionService,
    WebhookActionItemObjectService,
    WebhookCallerService,
} from './services';

class BlockchainServicesPlugin extends Plugin<void> {
    public getPluginId() {
        return 'services.blockchain';
    }

    public init() {
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
        mongoDbPlugin.addDao(MongodbPrometheusMetricDao);

        this.registerService(AwsMetricService);
        this.registerService(PrometheusMetricService);
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
    }
}

export { BlockchainServicesPlugin as Plugin };
