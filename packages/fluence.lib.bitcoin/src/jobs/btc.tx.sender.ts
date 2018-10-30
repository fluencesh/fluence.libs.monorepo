import { PluginManager } from '@applicature/core.plugin-manager';
import * as config from 'config';
import { BitcoinBlockchainService } from '../services/blockchain/bitcoin';
import { CompatibleBitcoinTransactionSender } from './compatible.btc.tx.sender';

export class BitcoinTransactionSender extends CompatibleBitcoinTransactionSender {
    constructor(pluginManager: PluginManager) {
        super(
            pluginManager,
            new BitcoinBlockchainService(),
            config.get('multivest.blockchain.bitcoin.sendFromAddress')
        );
    }

    public getJobId() {
        return 'btc.tx.sender';
    }
}
