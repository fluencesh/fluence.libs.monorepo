const config = require('config');
const logger = require('winston');

const { BitcoinTransactionSender } = require('@applicature/multivest.blockchain.bitcoin');

const { TxStatus } = require('@applicature/multivest.mongodb.ico');

const LitecoinService = require('../services/blockchain/litecoin');

const JOB_ID = 'ltc.tx.sender';

class LitecoinTransactionSender extends BitcoinTransactionSender {
    static getId() {
        return JOB_ID;
    }

    constructor(pluginManager, jobExecutor) {
        super(jobExecutor, JOB_ID, 'Litecoin Transaction Sender');

        this.pluginManager = pluginManager;

        this.blockchain = new LitecoinService();

        this.sendFromAddress = config.get('multivest.blockchain.litecoin.sendFromAddress');

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
}

module.exports = LitecoinTransactionSender;
