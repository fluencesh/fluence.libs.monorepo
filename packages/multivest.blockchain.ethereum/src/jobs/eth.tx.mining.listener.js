const config = require('config');
const logger = require('winston');

const { AbstractBlockchainListener } = require('@applicature/multivest.core');
const { TxStatus } = require('@applicature/multivest.mongodb.ico');

const EthereumService = require('../services/blockchain/ethereum');

class EthereumTxMiningListener extends AbstractBlockchainListener {
    constructor(executor) {
        super(executor, 'eth.tx.mining.listener', 'Ethereum Tx Mined Block Listener',
            new EthereumService(),
            config.get('blockchain.ethereum.listener.sinceBlock'),
            config.get('blockchain.ethereum.listener.minConfirmations'));
    }

    async processBlock(block) {
        const txMapping = {};

// eslint-disable-next-line no-restricted-syntax
        for (const tx of block.transactions) {
            txMapping[tx.hash] = tx;
        }

        if (block.transactions.length === 0) {
            return;
        }

        const transactions = await this.database.getTransactionsByStatus(
            EthereumService.getId(), TxStatus.SENT);

// eslint-disable-next-line no-restricted-syntax
        for (const transaction of transactions) {
// eslint-disable-next-line no-prototype-builtins
            if (txMapping.hasOwnProperty(transaction.txHash)) {
                const tx = txMapping[transaction.txHash];

                logger.info('ETH Listener: setting ethereum transaction mined block', {
                    txHash: tx.hash,
                    block: {
                        hash: block.hash,
                        number: block.number,
                        timestamp: block.timestamp,
                    },
                });

// eslint-disable-next-line no-await-in-loop
                await this.database.setTransactionMinedBlock(
                    EthereumService.getId(),
                    tx.hash,
                    block.hash,
                    block.number,
                    block.timestamp,
                );
            }
        }
    }
}

module.exports = EthereumTxMiningListener;
