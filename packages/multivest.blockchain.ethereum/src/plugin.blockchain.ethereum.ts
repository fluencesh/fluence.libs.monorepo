import { Plugin, Service } from '@applicature-private/multivest.core';
import { Plugin as MongodbPlugin } from '@applicature-private/multivest.mongodb';

class EthereumBlockchainPlugin extends Plugin<any> {
    public getPluginId() {
        return 'blockchain.ethereum';
    }

    public init() {
    }
}

export { EthereumBlockchainPlugin as Plugin };
