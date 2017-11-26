const logger = require('winston');

const { AbstractJob } = require('@applicature/multivest.core');

const { TxStatus } = require('@applicature/multivest.mongodb.ico');

class CompatibleBitcoinTransactionSender extends AbstractJob {
    constructor(pluginManager, blockchain, jobExecutor, jobId, jobTitle, sendFromAddress) {
        super(jobExecutor, jobId, jobTitle);

        this.pluginManager = pluginManager;

        this.blockchain = blockchain;

        this.sendFromAddress = sendFromAddress;

        jobExecutor.define(this.jobId, async (job, done) => {
            logger.info(`${this.jobTitle}: executing job`);

            try {
                await this.execute();

                logger.info(`${this.jobTitle}: executed`);

                done();
            }
            catch (err) {
                logger.error(`${this.jobTitle} failed to execute`, err);

                done(err);
            }
        });
    }

    async init() {
        this.dao = await this.pluginManager.get('mongodb').getDao();
    }

    async execute() {
        const transactions = await this.dao.transactions.listByNetworkAndStatus(
            this.blockchain.getNetworkId(),
            TxStatus.CREATED,
        );

// eslint-disable-next-line no-restricted-syntax
        for (const transaction of transactions) {
            logger.info(`${this.jobTitle}: send transaction`, transaction);

            let senderAddress = transaction.from;

            if (!senderAddress) {
                senderAddress = this.sendFromAddress;
            }

// eslint-disable-next-line no-await-in-loop
            let txHash;

            try {
// eslint-disable-next-line no-await-in-loop
                txHash = await this.blockchain.sendTransaction(
                    senderAddress,
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
            await this.dao.transactions.setHashAndStatus(transaction._id, txHash, TxStatus.SENT);
        }
    }
}

module.exports = CompatibleBitcoinTransactionSender;
