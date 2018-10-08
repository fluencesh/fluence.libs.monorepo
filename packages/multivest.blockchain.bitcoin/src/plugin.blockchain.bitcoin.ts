import { Plugin } from '@applicature-private/multivest.core';

class BitcoinBlockchainPlugin extends Plugin<void> {
    public getPluginId() {
        return 'blockchain.bitcoin';
    }

    public init() {
    }
}

export { BitcoinBlockchainPlugin as Plugin };
