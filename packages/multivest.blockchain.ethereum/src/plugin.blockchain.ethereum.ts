import { Plugin, Service } from '@applicature/multivest.core';
import { Plugin as MongodbPlugin } from '@applicature/multivest.mongodb';
import { EthereumBlockchainService } from './services/blockchain/ethereum';
import { ManagedEthereumTransportService } from './services/blockchain/managed.ethereum.transport.service';
import { EthersEthereumTransportService } from './services/transports/ethers.ethereum.transport';

class EthereumBlockchainPlugin extends Plugin<any> {
    public getPluginId() {
        return 'blockchain.ethereum';
    }

    public init() {
        const mongoDbPlugin: MongodbPlugin = this.pluginManager.get('mongodb') as any;
    }
}

export { EthereumBlockchainPlugin as Plugin };
