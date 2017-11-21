const { AbstractPlugin } = require('@applicature/multivest.core');

const EthereumTxMiningListener = require('./jobs/eth.tx.mining.listener');
const EthereumTransactionSender = require('./jobs/eth.tx.sender');

class EthereumBlockchainPlugin extends AbstractPlugin {
    constructor(pluginManager) {
        super(pluginManager, 'blockchain.ethereum');
    }

// eslint-disable-next-line class-methods-use-this
    init() {

    }

// eslint-disable-next-line class-methods-use-this
    getJobs() {
        return {
            [EthereumTxMiningListener.getId()]: EthereumTxMiningListener,
            [EthereumTransactionSender.getId()]: EthereumTransactionSender,
        };
    }
}

module.exports = EthereumBlockchainPlugin;
