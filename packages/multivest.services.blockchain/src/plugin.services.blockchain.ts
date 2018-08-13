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
    MongodbProjectBlockchainSetupDao,
    MongodbProjectDao,
    MongodbScheduledTxDao,
    MongodbSessionDao,
    MongodbTransactionDao,
    MongodbTransactionHashSubscriptionDao,
    MongodbTransportConnectionDao,
    MongodbWebhookActionDao,
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
    ProjectBlockchainSetupService,
    ProjectService,
    SessionService,
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

        this.registerService(AddressSubscriptionService);
        this.registerService(BlockchainRegistryService);
        this.registerService(ClientService);
        this.registerService(JobService);
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
    }
}

export { BlockchainServicesPlugin as Plugin };
