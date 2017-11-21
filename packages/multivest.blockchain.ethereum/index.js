const Plugin = require('./src/plugin.blockchain.ethereum');

const EthereumService = require('./src/services/blockchain/ethereum');

const EthereumTxMiningListener = require('./src/jobs/eth.tx.mining.listener');
const EthereumTransactionSender = require('./src/jobs/eth.tx.sender');

const ContractERC20 = require('./src/services/contracts/erc20.contract');

module.exports = {
    Plugin,

    EthereumService,

    // jobs
    EthereumTxMiningListener,
    EthereumTransactionSender,

    // contracts
    ContractERC20,
};
