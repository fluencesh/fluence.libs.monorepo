import { Plugin } from '@applicature-private/core.plugin-manager';

class BitcoinBlockchainPlugin extends Plugin<void> {
    public getPluginId() {
        return 'blockchain.bitcoin';
    }

    public init() {
    }
}

export { BitcoinBlockchainPlugin as Plugin };
