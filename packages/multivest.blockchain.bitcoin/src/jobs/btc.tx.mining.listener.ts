import * as config from 'config';
import { PluginManager } from '@applicature/multivest.core';
import { CompatibleBitcoinTxMiningListener } from './compatible.btc.tx.mining.listener';
import { BitcoinBlockchainService } from '../services/blockchain/bitcoin';

export class BitcoinTxMiningListener extends CompatibleBitcoinTxMiningListener {
    getJobId() {
        return 'btc.tx.mining.listener';
    }

    constructor(pluginManager: PluginManager) {
        super(
            pluginManager,
            new BitcoinBlockchainService(),
            config.get('multivest.blockchain.bitcoin.listener.sinceBlock'),
            config.get('multivest.blockchain.bitcoin.listener.minConfirmations')
        );
    }
}
