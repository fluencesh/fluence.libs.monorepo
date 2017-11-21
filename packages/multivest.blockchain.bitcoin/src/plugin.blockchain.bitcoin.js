const { AbstractPlugin } = require('@applicature/multivest.core');

const BitcoinTxMiningListener = require('./jobs/btc.tx.mining.listener');
const BitcoinTransactionSender = require('./jobs/btc.tx.sender');

class BitcoinBlockchainPlugin extends AbstractPlugin {
    constructor(pluginManager) {
        super(pluginManager, 'blockchain.bitcoin');
    }

// eslint-disable-next-line class-methods-use-this
    init() {

    }

// eslint-disable-next-line class-methods-use-this
    getJobs() {
        return {
            [BitcoinTxMiningListener.getId()]: BitcoinTxMiningListener,
            [BitcoinTransactionSender.getId()]: BitcoinTransactionSender,
        };
    }
}

module.exports = BitcoinBlockchainPlugin;
