import { Plugin } from '@applicature/synth.plugin-manager';

class BitcoinBlockchainPlugin extends Plugin<void> {
    public getPluginId() {
        return 'blockchain.bitcoin';
    }

    public init() {
    }
}

export { BitcoinBlockchainPlugin as Plugin };
