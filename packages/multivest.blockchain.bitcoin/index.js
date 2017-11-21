const Plugin = require('./src/plugin.blockchain.bitcoin');

const BitcoinService = require('./src/services/blockchain/bitcoin');

const BitcoinTxMiningListener = require('./src/jobs/btc.tx.mining.listener');
const BitcoinTransactionSender = require('./src/jobs/btc.tx.sender');

const BitcoinConstant = require('./src/services/constants/bitcoin.constant');

module.exports = {
    Plugin,

    BitcoinService,

    // jobs
    BitcoinTxMiningListener,
    BitcoinTransactionSender,

    // constants
    BitcoinConstant,
};
