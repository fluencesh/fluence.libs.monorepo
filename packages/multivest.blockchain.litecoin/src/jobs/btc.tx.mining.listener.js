const config = require('config');
const logger = require('winston');

const { AbstractBlockchainListener } = require('@applicature/multivest.core');
const { TxStatus } = require('@applicature/multivest.mongodb.ico');

const BitcoinService = require('../services/blockchain/bitcoin');

const JOB_ID = 'btc.tx.mining.listener';

class BitcoinTxMiningListener extends AbstractBlockchainListener {
    static getId() {
        return JOB_ID;
    }

    constructor(pluginManager, executor) {
        super(pluginManager, executor, JOB_ID, 'Bitcoin Tx Mined Block Listener',
            new BitcoinService(),
            config.get('multivest.blockchain.bitcoin.listener.sinceBlock'),
            config.get('multivest.blockchain.bitcoin.listener.minConfirmations'));

        this.pluginManager = pluginManager;

        // @TODO: set database

        this.database = null; // database;
    }

    async processBlock(block) {
        const txMapping = {};

// eslint-disable-next-line no-restricted-syntax
        for (const tx of block.tx) {
            txMapping[tx.hash] = tx;
        }

        if (block.tx.length === 0) {
            return;
        }

        const transactions = await this.database.getTransactionsByStatus(
            this.blockchain.getNetworkId(), TxStatus.SENT);

// eslint-disable-next-line no-restricted-syntax
        for (const transaction of transactions) {
// eslint-disable-next-line no-prototype-builtins
            if (txMapping.hasOwnProperty(transaction.txHash)) {
                const tx = txMapping[transaction.txHash];

                logger.info(`${this.jobTitle}: setting transaction mined block`, {
                    txHash: tx.hash,
                    block: {
                        hash: block.hash,
                        number: block.height,
                        timestamp: block.time,
                    },
                });

// eslint-disable-next-line no-await-in-loop
                this.database.setTransactionMinedBlock(
                    this.blockchain.getNetworkId(),
                    tx.hash,
                    block.hash,
                    block.height,
                    block.time,
                );
            }
        }
    }
}

module.exports = BitcoinTxMiningListener;
