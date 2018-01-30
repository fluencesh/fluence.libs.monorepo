import { Dao, Hashtable, Job, PluginManager } from '@applicature/multivest.core';
import { IcoCompositeDao, Scheme, TransactionDao } from '@applicature/multivest.mongodb.ico';
import * as Agenda from 'agenda';
import * as config from 'config';
import * as logger from 'winston';
import { BitcoinBlockchainService } from '../services/blockchain/bitcoin';

export abstract class CompatibleBitcoinTransactionSender extends Job {
    private daos: Hashtable<IcoCompositeDao>;

    constructor(
        pluginManager: PluginManager,
        private blockchainService: BitcoinBlockchainService,
        private sendFromAddress: string
    ) {
        super(pluginManager);
    }

    public async init() {
        this.daos = await this.pluginManager.get('mongodb').getDaos() as Hashtable<IcoCompositeDao>;
    }

    public async execute() {
        const transactionDao = this.daos.transactions as TransactionDao;
        const transactions = await transactionDao.listByNetworkAndStatus(
            this.blockchainService.getBlockchainId(),
            Scheme.TransactionStatus.Created
        );

        for (const transaction of transactions) {
            logger.info(`${this.getJobId()}: send transaction`, transaction);



            if (!transaction.ref.from[0].address) {
                transaction.ref.from[0].address = this.sendFromAddress;
            }

            let txHash;

            try {
                txHash = await this.blockchainService.sendTransaction({
                    fee: transaction.ref.fee,
                    from: transaction.ref.from,
                    hash: transaction.ref.hash,
                    to: transaction.ref.to,
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

            await transactionDao.setHashAndStatus(
                transaction.id,
                txHash,
                Scheme.TransactionStatus.Sent
            );
        }
    }
}
