const config = require('config');
const logger = require('winston');
const { BitcoinTxMiningListener } = require('@applicature/multivest.blockchain.bitcoin');
const { TxStatus } = require('@applicature/multivest.mongodb.ico');

const LitecoinService = require('../services/blockchain/litecoin');

const JOB_ID = 'ltc.tx.mining.listener';

class LitecoinTxMiningListener extends BitcoinTxMiningListener {
    constructor(pluginManager, executor) {
        super(pluginManager, executor, JOB_ID, 'Litecoin Tx Mined Block Listener',
            new LitecoinService(),
            config.get('multivest.blockchain.litecoin.listener.sinceBlock'),
            config.get('multivest.blockchain.litecoin.listener.minConfirmations'));

        this.pluginManager = pluginManager;

        // @TODO: set database

        this.database = null; // database;
    }
}

module.exports = LitecoinTxMiningListener;
