import { Plugin, Service } from '@applicature/multivest.core';
import { Plugin as MongodbPlugin } from '@applicature/multivest.mongodb';
import { EthereumBlockchainService } from './services/blockchain/ethereum';
import { EthersEthereumTransportService } from './services/transports/ethers.ethereum.transport';
import { ManagedEthereumTransportService } from './services/transports/managed.ethereum.transport.service';

class EthereumBlockchainPlugin extends Plugin<any> {
    public getPluginId() {
        return 'blockchain.ethereum';
    }

    public init() {
        const mongoDbPlugin: MongodbPlugin = this.pluginManager.get('mongodb') as any;
    }
}

export { EthereumBlockchainPlugin as Plugin };
