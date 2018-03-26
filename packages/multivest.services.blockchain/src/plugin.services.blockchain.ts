import { Plugin } from '@applicature/multivest.core';
import { Plugin as MongodbPlugin } from '@applicature/multivest.mongodb';
import { MongodbJobDao } from './dao/mongodb/job.dao';
import { MongodbTransactionDao } from './dao/mongodb/transaction.dao';

class BlockchainServicesPlugin extends Plugin<void> {
    public getPluginId() {
        return 'services.blockchain';
    }

    public init() {
        const mongoDbPlugin = this.pluginManager.get('mongodb') as MongodbPlugin;

        mongoDbPlugin.addDao(MongodbJobDao);
        mongoDbPlugin.addDao(MongodbTransactionDao);
    }
}

export { BlockchainServicesPlugin as Plugin };
