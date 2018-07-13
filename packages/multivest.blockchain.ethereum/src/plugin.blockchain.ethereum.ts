import { Plugin, Service } from '@applicature/multivest.core';
import { Plugin as MongodbPlugin } from '@applicature/multivest.mongodb';
import { MongodbOraclizeSubscriptionDao } from './dao/mongodb/oraclize.subscription.dao';
import { OraclizeSubscriptionService } from './services/objects/oraclize.subscription.service';

class EthereumBlockchainPlugin extends Plugin<any> {
    public getPluginId() {
        return 'blockchain.ethereum';
    }

    public init() {
        const mongoDbPlugin: MongodbPlugin = this.pluginManager.get('mongodb') as any;

        mongoDbPlugin.addDao(MongodbOraclizeSubscriptionDao);

        this.registerService(OraclizeSubscriptionService);
    }
}

export { EthereumBlockchainPlugin as Plugin };
