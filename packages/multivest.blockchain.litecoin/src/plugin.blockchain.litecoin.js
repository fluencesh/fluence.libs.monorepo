const { AbstractPlugin } = require('@applicature/multivest.core');

const LitecoinTxMiningListener = require('./jobs/btc.tx.mining.listener');
const LitecoinTransactionSender = require('./jobs/btc.tx.sender');

class LitecoinBlockchainPlugin extends AbstractPlugin {
    constructor(pluginManager) {
        super(pluginManager, 'blockchain.litecoin');
    }

// eslint-disable-next-line class-methods-use-this
    init() {

    }

// eslint-disable-next-line class-methods-use-this
    getJobs() {
        return {
            [LitecoinTxMiningListener.getId()]: LitecoinTxMiningListener,
            [LitecoinTransactionSender.getId()]: LitecoinTransactionSender,
        };
    }
}

module.exports = LitecoinBlockchainPlugin;
