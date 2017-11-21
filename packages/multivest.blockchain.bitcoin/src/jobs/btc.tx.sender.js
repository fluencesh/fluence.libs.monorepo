const config = require('config');
const logger = require('winston');

const { AbstractJob } = require('@applicature/multivest.core');

const { TxStatus } = require('@applicature/multivest.mongodb.ico');
const { BitcoinConstant } = require('../services/constants/bitcoin.constant');

const BitcoinService = require('../services/blockchain/bitcoin');

export default class BitcoinTransactionSender extends AbstractJob {
    constructor(jobExecutor, sendFromAddress) {
        super(jobExecutor, 'btc.tx.sender', 'Bitcoin Transaction Sender');

        this.bitcoin = new BitcoinService();

        if (!sendFromAddress) {
            this.sendFromAddress = config.get('blockchain.bitcoin.sendFromAddress');
        }
        else {
            this.sendFromAddress = sendFromAddress;
        }

        jobExecutor.define(this.jobId, async (job, done) => {
            logger.info(`${this.jobTitle}: executing job`);

            try {
                await this.execute();
            }
            catch (err) {
                logger.error(`${this.jobTitle} failed to execute`, err);

                done(err);
            }
        });
    }

    async execute() {
        const transactions = await this.database.getTransactionsByStatus(
            BitcoinConstant.BITCOIN,
            TxStatus.CREATED,
        );

// eslint-disable-next-line no-restricted-syntax
        for (const transaction of transactions) {
            logger.info(`${this.jobTitle}: send transaction`, transaction);

// eslint-disable-next-line no-await-in-loop
            let txHash;

            try {
// eslint-disable-next-line no-await-in-loop
                txHash = await this.bitcoin.sendTransaction(

                    transaction.from,
                    transaction.to,
                    transaction.value,
                    transaction.fee,
                );
            }
            catch (error) {
// eslint-disable-next-line no-underscore-dangle
                logger.error(`transaction sending failed ${transaction._id}`, error);

                throw error;
            }

            logger.info(`${this.jobTitle}: transaction sent`, {
                transaction,
                txHash,
            });

// eslint-disable-next-line no-underscore-dangle,no-await-in-loop
            await this.database.setTransactionHashAndStatus(transaction._id, txHash, TxStatus.SENT);
        }
    }
}

module.exports = EthereumTransactionSender;
