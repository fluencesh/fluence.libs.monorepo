import { Plugin } from '@applicature/multivest.core';
import { BitcoinTxMiningListener } from './jobs/btc.tx.mining.listener';
import { BitcoinTransactionSender } from './jobs/btc.tx.sender';

class BitcoinBlockchainPlugin extends Plugin<void> {
    public getPluginId() {
        return 'blockchain.bitcoin';
    }

    public init() {
        this.registerJob(BitcoinTxMiningListener);
        this.registerJob(BitcoinTransactionSender);
    }
}

export { BitcoinBlockchainPlugin as Plugin };
