import * as config from 'config';

import { CompatibleBitcoinTxMiningListener } from '@applicature-restricted/multivest.blockchain.bitcoin';
import { PluginManager } from '@applicature/multivest.core';

import { LitecoinBlockchainService } from '../services/litecoin';

const JOB_ID = 'ltc.tx.mining.listener';

export class LitecoinTxMiningListener extends CompatibleBitcoinTxMiningListener {
    constructor(pluginManager: PluginManager) {
        const service = new LitecoinBlockchainService();
        super(
            pluginManager,
            service,
            config.get('multivest.blockchain.litecoin.listener.sinceBlock'),
            config.get('multivest.blockchain.litecoin.listener.minConfirmations')
        );
    }

    public getJobId() {
        return JOB_ID;
    }
}
