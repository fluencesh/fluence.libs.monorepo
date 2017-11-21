const config = require('config');
const logger = require('winston');

const { AbstractJob } = require('@applicature/multivest.core');

const { TxStatus } = require('@applicature/multivest.mongodb.ico');

const EthereumService = require('../services/blockchain/ethereum');

const JOB_ID = 'eth.tx.sender';

class EthereumTransactionSender extends AbstractJob {
    static getId() {
        return JOB_ID;
    }

    constructor(jobExecutor) {
        super(jobExecutor, JOB_ID, 'Ethereum Transaction Sender');

        this.ethereum = new EthereumService();

        this.sendFromAddress = config.get('contracts.ico.ethereum.fromAddress');

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
            EthereumService.getId(),
            TxStatus.CREATED,
        );

// eslint-disable-next-line no-restricted-syntax
        for (const transaction of transactions) {
            logger.info(`${this.jobTitle}: send transaction`, transaction);

// eslint-disable-next-line no-await-in-loop
            const txCount = await this.database.getTransactionsCountByAddress(
                EthereumService.getId(),
                this.sendFromAddress,
            );

            let txHash;

            try {
// eslint-disable-next-line no-await-in-loop
                txHash = await this.ethereum.sendTransaction(
                    transaction.from,
                    transaction.to,
                    transaction.value,
                    transaction.extra.data,
                    txCount, // nonce
                    transaction.extra.gasLimit,
                    transaction.extra.gasPrice,
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
