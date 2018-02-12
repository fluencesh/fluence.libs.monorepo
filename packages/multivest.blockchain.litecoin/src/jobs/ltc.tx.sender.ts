import * as config from 'config';

import { CompatibleBitcoinTransactionSender } from '@applicature-restricted/multivest.blockchain.bitcoin';
import { PluginManager } from '@applicature/multivest.core';

import { LitecoinBlockchainService } from '../services/litecoin';

const JOB_ID = 'ltc.tx.sender';

export class LitecoinTransactionSender extends CompatibleBitcoinTransactionSender {
    constructor(pluginManager: PluginManager) {
        const service = new LitecoinBlockchainService();
        super(pluginManager, service, config.get('multivest.blockchain.litecoin.sendFromAddress'));
    }

    public getJobId() {
        return JOB_ID;
    }
}
