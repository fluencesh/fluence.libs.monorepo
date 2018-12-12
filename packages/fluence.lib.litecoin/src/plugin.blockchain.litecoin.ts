import { Plugin, PluginManager } from '@applicature/synth.plugin-manager';

class LitecoinBlockchainPlugin extends Plugin<any> {
    constructor(pluginManager: PluginManager) {
        super(pluginManager);
    }

    public getPluginId() {
        return 'blockchain.litecoin';
    }

    public init() {
        return Promise.resolve();
    }
}

export { LitecoinBlockchainPlugin as Plugin };
