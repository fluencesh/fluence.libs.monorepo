import { Plugin } from '@applicature/core.plugin-manager';

class BitcoinBlockchainPlugin extends Plugin<void> {
    public getPluginId() {
        return 'blockchain.bitcoin';
    }

    public init() {
    }
}

export { BitcoinBlockchainPlugin as Plugin };
