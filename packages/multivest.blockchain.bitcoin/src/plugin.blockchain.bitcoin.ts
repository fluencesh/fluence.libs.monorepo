import { Plugin } from '@applicature/multivest.core';
import { BitcoinTxMiningListener } from './jobs/btc.tx.mining.listener';
import { BitcoinTransactionSender } from './jobs/btc.tx.sender';

class BitcoinBlockchainPlugin extends Plugin<void> {
    getPluginId() {
        return 'blockchain.bitcoin';
    }

    init() {
        this.registerJob(BitcoinTxMiningListener);
        this.registerJob(BitcoinTransactionSender);
    }
}

export { BitcoinBlockchainPlugin as Plugin };
