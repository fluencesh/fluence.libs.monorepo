// const config = require('config');

// const CompatibleBtxTxSender = require('./compatible.btc.tx.sender');

// const BitcoinService = require('../services/blockchain/bitcoin');

import * as config from 'config';
import { PluginManager } from '@applicature/multivest.core';
import { CompatibleBitcoinTransactionSender } from './compatible.btc.tx.sender';
import { BitcoinBlockchainService } from '../services/blockchain/bitcoin';

export class BitcoinTransactionSender extends CompatibleBitcoinTransactionSender {
    
    getJobId() {
        return 'btc.tx.sender';
    }

    constructor(pluginManager: PluginManager) {
        super(
            pluginManager,
            new BitcoinBlockchainService(),
            config.get('multivest.blockchain.bitcoin.sendFromAddress')
        );
    }
}
