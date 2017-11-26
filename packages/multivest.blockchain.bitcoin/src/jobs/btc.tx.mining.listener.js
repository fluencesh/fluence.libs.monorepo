const config = require('config');

const CompatibleBtcMiningListener = require('./compatible.btc.tx.mining.listener');
const BitcoinService = require('../services/blockchain/bitcoin');

const JOB_ID = 'btc.tx.mining.listener';

class BitcoinTxMiningListener extends CompatibleBtcMiningListener {
    static getId() {
        return JOB_ID;
    }

    constructor(pluginManager, executor) {
        super(pluginManager, executor, JOB_ID, 'Bitcoin Tx Mined Block Listener',
            new BitcoinService(),
            config.get('multivest.blockchain.bitcoin.listener.sinceBlock'),
            config.get('multivest.blockchain.bitcoin.listener.minConfirmations'));

        this.pluginManager = pluginManager;
    }
}

module.exports = BitcoinTxMiningListener;
