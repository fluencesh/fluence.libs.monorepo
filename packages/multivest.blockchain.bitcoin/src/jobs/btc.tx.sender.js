const config = require('config');

const CompatibleBtxTxSender = require('./compatible.btc.tx.sender');

const BitcoinService = require('../services/blockchain/bitcoin');

const JOB_ID = 'btc.tx.sender';

class BitcoinTransactionSender extends CompatibleBtxTxSender {
    static getId() {
        return JOB_ID;
    }

    constructor(pluginManager, jobExecutor) {
        super(
            pluginManager,
            new BitcoinService(),
            jobExecutor,
            JOB_ID, 'Bitcoin Transaction Sender',
            config.get('multivest.blockchain.bitcoin.sendFromAddress'),
        );
    }
}

module.exports = BitcoinTransactionSender;
