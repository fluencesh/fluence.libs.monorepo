// const logger = require('winston');

// const { AbstractJob } = require('@applicature/multivest.core');

// const { TxStatus } = require('@applicature/multivest.mongodb.ico');
import * as config from 'config';
import * as logger from 'winston';
import * as Agenda from 'agenda';
import { Dao, Job, Hashtable, PluginManager } from '@applicature/multivest.core';
import { IcoCompositeDao, TransactionDao, TransactionStatus } from '@applicature/multivest.mongodb.ico';
import { BitcoinService } from '../services/blockchain/bitcoin';


export abstract class CompatibleBitcoinTransactionSender extends Job {
    private daos: Hashtable<IcoCompositeDao>;

    constructor(
        pluginManager: PluginManager, 
        private blockchainService: BitcoinService, 
        private sendFromAddress: string
    ) {
        super(pluginManager, pluginManager.getExecutor());

        this.jobExecutor.define(this.getJobId(), async (job, done) => {
            logger.info(`${this.getJobId()}: executing job`);

            try {
                await this.execute();

                logger.info(`${this.getJobId()}: executed`);

                done();
            }
            catch (err) {
                logger.error(`${this.getJobId()} failed to execute`, err);

                done(err);
            }
        });
    }

    async init() {
        this.daos = await this.pluginManager.get('mongodb').getDaos() as Hashtable<IcoCompositeDao>;
    }

    async execute() {
        const transactionDao = this.daos.transactions as TransactionDao;
        const transactions = await transactionDao.listByNetworkAndStatus(
            this.blockchainService.getBlockchainId(),
            TransactionStatus.Created
        );

        for (const transaction of transactions) {
            logger.info(`${this.getJobId()}: send transaction`, transaction);



            if (!transaction.tx.from[0].address) {
                transaction.tx.from[0].address = this.sendFromAddress;
            }

            let txHash;

            try {
                txHash = await this.blockchainService.sendTransaction({
                    hash: transaction.tx.hash,
                    from: transaction.tx.from,
                    to: transaction.tx.to,
                    fee: transaction.tx.fee
                });
            }
            catch (error) {
                logger.error(`transaction sending failed ${transaction.uniqId}`, error);
                throw error;
            }

            logger.info(`${this.getJobId()}: transaction sent`, {
                transaction,
                txHash,
            });

            //@TODO: add _id
            await transactionDao.setHashAndStatus(
                transaction.uniqId, 
                txHash, 
                TransactionStatus.Sent
            );
        }
    }
}
