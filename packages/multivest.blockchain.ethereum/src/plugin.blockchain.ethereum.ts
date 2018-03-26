import { Plugin } from '@applicature/multivest.core';

class EthereumBlockchainPlugin extends Plugin<any> {
    public getPluginId() {
        return 'blockchain.ethereum';
    }

    public init() {

    }
}

export { EthereumBlockchainPlugin as Plugin };
