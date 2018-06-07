import { Plugin, PluginManager } from '@applicature/multivest.core';

import { LitecoinTxMiningListener } from './jobs/ltc.tx.mining.listener';
import { LitecoinTransactionSender } from './jobs/ltc.tx.sender';

class LitecoinBlockchainPlugin extends Plugin<any> {
    constructor(pluginManager: PluginManager) {
        super(pluginManager);
    }

    public getPluginId() {
        return 'blockchain.litecoin';
    }

    public init() {
    }
}

export { LitecoinBlockchainPlugin as Plugin };
