import { PluginManager } from '@applicature/multivest.core';
import * as config from 'config';
import { BitcoinBlockchainService } from '../services/blockchain/bitcoin';
import { CompatibleBitcoinTransactionSender } from './compatible.btc.tx.sender';

export class BitcoinTransactionSender extends CompatibleBitcoinTransactionSender {
    constructor(pluginManager: PluginManager) {
        super(
            pluginManager,
            config.get('multivest.blockchain.bitcoin.sendFromAddress'),
            Buffer.alloc(0) // FIXME: should pass privateKey
        );
    }

    public getJobId() {
        return 'btc.tx.sender';
    }
}
