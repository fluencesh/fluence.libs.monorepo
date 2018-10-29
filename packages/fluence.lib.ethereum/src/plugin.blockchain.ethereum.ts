import { Plugin } from '@applicature-private/core.plugin-manager';

class EthereumBlockchainPlugin extends Plugin<any> {
    public getPluginId() {
        return 'blockchain.ethereum';
    }

    public init() {
        return Promise.resolve();
    }
}

export { EthereumBlockchainPlugin as Plugin };
