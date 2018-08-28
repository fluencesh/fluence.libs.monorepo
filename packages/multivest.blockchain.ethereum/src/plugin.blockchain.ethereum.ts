import { Plugin, Service } from '@fluencesh/multivest.core';
import { Plugin as MongodbPlugin } from '@fluencesh/multivest.mongodb';

class EthereumBlockchainPlugin extends Plugin<any> {
    public getPluginId() {
        return 'blockchain.ethereum';
    }

    public init() {
    }
}

export { EthereumBlockchainPlugin as Plugin };
