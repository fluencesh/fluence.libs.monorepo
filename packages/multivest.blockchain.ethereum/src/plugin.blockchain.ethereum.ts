import { Plugin, Service } from '@applicature/multivest.core';
import { Plugin as MongodbPlugin } from '@applicature/multivest.mongodb';
import { ContractDao } from './dao/contract.dao';
import { MongoContractDao } from './dao/mongodb/contract.dao';
import { MongodbEthereumContractSubscriptionDao } from './dao/mongodb/ethereum.contract.subscription.dao';
import { MongodbEthereumEventLogDao } from './dao/mongodb/ethereum.event.log.dao';
import { EthereumBlockchainService } from './services/blockchain/ethereum';
import { ManagedEthereumTransportService } from './services/blockchain/managed.ethereum.transport.service';
import { ContractService } from './services/objects/contract.service';
import { EthereumContractSubscriptionService } from './services/objects/ethereum.contract.subscription.service';
import { EthereumEventLogService } from './services/objects/ethereum.event.log.service';
import { EthersEthereumTransportService } from './services/transports/ethers.ethereum.transport';

class EthereumBlockchainPlugin extends Plugin<any> {
    public getPluginId() {
        return 'blockchain.ethereum';
    }

    public init() {
        const mongoDbPlugin: MongodbPlugin = this.pluginManager.get('mongodb') as any;
        mongoDbPlugin.addDao(MongoContractDao);
        mongoDbPlugin.addDao(MongodbEthereumContractSubscriptionDao);
        mongoDbPlugin.addDao(MongodbEthereumEventLogDao);

        this.registerService(ContractService);
        this.registerService(EthereumContractSubscriptionService);
        this.registerService(EthereumEventLogService);
    }
}

export { EthereumBlockchainPlugin as Plugin };
