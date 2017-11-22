const Plugin = require('./src/plugin.blockchain.litecoin');

const LitecoinService = require('./src/services/blockchain/litecoin');

const LitecoinTxMiningListener = require('./src/jobs/ltc.tx.mining.listener');
const LitecoinTransactionSender = require('./src/jobs/ltc.tx.sender');

const LitecoinConstant = require('./src/services/constants/litecoin.constant');

module.exports = {
    Plugin,

    LitecoinService,

    // jobs
    LitecoinTxMiningListener,
    LitecoinTransactionSender,

    // constants
    LitecoinConstant,
};
