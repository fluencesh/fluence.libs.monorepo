const config = require('config');

const { CompatibleBitcoinTransactionSender } = require('@applicature/multivest.blockchain.bitcoin');

const LitecoinService = require('../services/blockchain/litecoin');

const JOB_ID = 'ltc.tx.sender';

class LitecoinTransactionSender extends CompatibleBitcoinTransactionSender {
    static getId() {
        return JOB_ID;
    }

    constructor(pluginManager, jobExecutor) {
        super(
            pluginManager,
            new LitecoinService(), jobExecutor,
            JOB_ID, 'Litecoin Transaction Sender',
            config.get('multivest.blockchain.litecoin.sendFromAddress'),
        );
    }
}

module.exports = LitecoinTransactionSender;
