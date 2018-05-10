import { Plugin, Service } from '@applicature/multivest.core';
import { Plugin as MongodbPlugin } from '@applicature/multivest.mongodb';

import { MongodbAddressSubscriptionDao } from './dao/mongodb/address.subscription.dao';
import { MongodbClientDao } from './dao/mongodb/client.dao';
import { MongoContractDao } from './dao/mongodb/contract.dao';
import { MongodbEthereumContractSubscriptionDao } from './dao/mongodb/ethereum.contract.subscription.dao';
import { MongodbEthereumEventLogDao } from './dao/mongodb/ethereum.event.log.dao';
import { MongodbJobDao } from './dao/mongodb/job.dao';
import { MongodbProjectDao } from './dao/mongodb/project.dao';
import { MongodbTransactionDao } from './dao/mongodb/transaction.dao';
import { MongodbTransactionHashSubscriptionDao } from './dao/mongodb/transaction.hash.subscription.dao';
import { MongodbTransportConnectionDao } from './dao/mongodb/transport.connection.dao';
import { MongodbWebhookActionDao } from './dao/mongodb/webhook.action.dao';

import { BlockchainRegistryService } from './services/blockchain/blockchain.registry.service';
import { ManagedBlockchainTransportService } from './services/blockchain/managed.blockchain.transport.service';
import { AddressSubscriptionService } from './services/object/address.subscription.service';
import { ClientService } from './services/object/client.service';
import { ContractService } from './services/object/contract.service';
import { EthereumContractSubscriptionService } from './services/object/ethereum.contract.subscription.service';
import { EthereumEventLogService } from './services/object/ethereum.event.log.service';
import { JobService } from './services/object/job.service';
import { ProjectService } from './services/object/project.service';
import { TransactionHashSubscriptionService } from './services/object/transaction.hash.subscription.service';
import { TransactionService } from './services/object/transaction.service';
import { TransportConnectionService } from './services/object/transport.connection.service';
import { WebhookActionItemObjectService } from './services/object/webhook.action.service';
import { WebhookCallerService } from './services/webhook/webhook.caller.service';

class BlockchainServicesPlugin extends Plugin<void> {
    public getPluginId() {
        return 'services.blockchain';
    }

    public init() {
        const mongoDbPlugin = this.pluginManager.get('mongodb') as MongodbPlugin;

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
    }
}

export { BlockchainServicesPlugin as Plugin };
