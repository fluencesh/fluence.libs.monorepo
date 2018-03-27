import { Plugin } from '@applicature/multivest.core';
import { Plugin as MongodbPlugin } from '@applicature/multivest.mongodb';

import { MongodbAddressSubscriptionDao } from './dao/mongodb/address.subscription.dao';
import { MongodbClientDao } from './dao/mongodb/client.dao';
import { MongodbEthereumContractSubscriptionDao } from './dao/mongodb/ethereum.contract.subscription.dao';
import { MongodbEthereumEventLogDao } from './dao/mongodb/ethereum.event.log.dao';
import { MongodbJobDao } from './dao/mongodb/job.dao';
import { MongodbProjectDao } from './dao/mongodb/project.dao';
import { MongodbTransactionDao } from './dao/mongodb/transaction.dao';
import { MongodbWebHookActionDao } from './dao/mongodb/webhook.action.dao';

import { ClientService } from './services/object/client.service';
import { EthereumContractSubscriptionService } from './services/object/ethereum.contract.subscription.service';
import { EthereumEventLogService } from './services/object/ethereum.event.log.service';
import { JobService } from './services/object/job.service';
import { ProjectService } from './services/object/project.service';
import { TransactionService } from './services/object/transaction.service';
import { WebhookActionItemObjectService } from './services/object/webhook.action.service';
import { WebHookCallerService } from './services/webhook/webhook.caller.service';

class BlockchainServicesPlugin extends Plugin<void> {
    public getPluginId() {
        return 'services.blockchain';
    }

    public init() {
        const mongoDbPlugin = this.pluginManager.get('mongodb') as MongodbPlugin;

        mongoDbPlugin.addDao(MongodbAddressSubscriptionDao);
        mongoDbPlugin.addDao(MongodbClientDao);
        mongoDbPlugin.addDao(MongodbEthereumContractSubscriptionDao);
        mongoDbPlugin.addDao(MongodbEthereumEventLogDao);
        mongoDbPlugin.addDao(MongodbJobDao);
        mongoDbPlugin.addDao(MongodbProjectDao);
        mongoDbPlugin.addDao(MongodbTransactionDao);
        mongoDbPlugin.addDao(MongodbWebHookActionDao);

        this.registerService(ClientService);
        this.registerService(EthereumContractSubscriptionService);
        this.registerService(EthereumEventLogService);
        this.registerService(JobService);
        this.registerService(ProjectService);
        this.registerService(TransactionService);
        this.registerService(WebhookActionItemObjectService);
        this.registerService(WebHookCallerService);
    }
}

export { BlockchainServicesPlugin as Plugin };
