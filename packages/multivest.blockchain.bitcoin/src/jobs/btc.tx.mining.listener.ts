import { PluginManager } from '@applicature/multivest.core';
import * as config from 'config';
import { BitcoinBlockchainService } from '../services/blockchain/bitcoin';
import { CompatibleBitcoinTxMiningListener } from './compatible.btc.tx.mining.listener';

export class BitcoinTxMiningListener extends CompatibleBitcoinTxMiningListener {
    constructor(pluginManager: PluginManager) {
        super(
            pluginManager,
            new BitcoinBlockchainService(),
            config.get('multivest.blockchain.bitcoin.listener.sinceBlock'),
            config.get('multivest.blockchain.bitcoin.listener.minConfirmations')
        );
    }

    public getJobId() {
        return 'btc.tx.mining.listener';
    }

}
