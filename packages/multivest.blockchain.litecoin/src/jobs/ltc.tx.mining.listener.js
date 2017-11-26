const config = require('config');
const { BitcoinTxMiningListener } = require('@applicature/multivest.blockchain.bitcoin');

const LitecoinService = require('../services/blockchain/litecoin');

const JOB_ID = 'ltc.tx.mining.listener';

class LitecoinTxMiningListener extends BitcoinTxMiningListener {
    static getId() {
        return JOB_ID;
    }

    constructor(pluginManager, executor) {
        super(pluginManager, executor, JOB_ID, 'Litecoin Tx Mined Block Listener',
            new LitecoinService(),
            config.get('multivest.blockchain.litecoin.listener.sinceBlock'),
            config.get('multivest.blockchain.litecoin.listener.minConfirmations'));

        this.pluginManager = pluginManager;
    }
}

module.exports = LitecoinTxMiningListener;
