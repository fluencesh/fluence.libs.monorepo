import { Dao, Hashtable, Job, PluginManager } from '@applicature/multivest.core';
import { Scheme, TransactionDao } from '@applicature/multivest.mongodb.ico';
import * as config from 'config';
import * as logger from 'winston';
import { EthereumBlockchainService } from '../services/blockchain/ethereum';
import { EthereumTransaction } from '../services/blockchain/model';

export class EthereumTransactionSender extends Job {
    private blockchainService: EthereumBlockchainService;
    private sendFromAddress: string;
    private dao: Hashtable<Dao<any>>;

    constructor(pluginManager: PluginManager) {
        super(pluginManager);
        this.blockchainService = new EthereumBlockchainService();
        this.sendFromAddress = config.get('multivest.blockchain.ethereum.senderAddress');

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

    public getJobId() {
        return 'eth.tx.sender';
    }

    public async init() {
        this.dao = await this.pluginManager.get('mongodb').getDaos();
    }

    public async execute() {
        const transactionDao = this.dao.transactions as TransactionDao;
        const transactions = await transactionDao.listByNetworkAndStatus(
            this.blockchainService.getBlockchainId(),
            Scheme.TransactionStatus.Created
        );

        for (const transaction of transactions) {
            logger.info(`${this.getJobId()}: send transaction`, transaction);

            const senderAddress = transaction.ref.from;

            if (!senderAddress[0].address) {
                senderAddress[0].address = this.sendFromAddress;

                // @TODO: save address to db

                await transactionDao.update(
                    {
                        blockchain: this.blockchainService.getBlockchainId(),
                        uniqId: transaction.uniqId
                    },
                    {
                        'ref.from': senderAddress
                    }
                );
            }

            const txCount = await transactionDao.getCountByAddress(
                this.blockchainService.getBlockchainId(),
                senderAddress[0].address
            );

            let txHash;

            try {
                txHash = await this.blockchainService.sendTransaction(
                    Object.assign(transaction.ref, {
                        nonce: txCount - 1
                    })
                );
            }
            catch (error) {
                logger.error(`transaction sending failed ${transaction.uniqId}`, error);

                throw error;
            }

            logger.info(`${this.getJobId()}: transaction sent`, {
                transaction,
                txHash
            });

            await transactionDao.update(
                {
                    blockchain: this.blockchainService.getBlockchainId(),
                    uniqId: transaction.uniqId
                },
                {
                    'ref.hash': txHash,
                    status: Scheme.TransactionStatus.Sent
                }
            );
        }
    }
}
