import { Dao, Hashtable, Job, PluginManager, Transaction } from '@applicature-private/multivest.core';
import { Scheme, TransactionDao } from '@applicature-private/multivest.services.blockchain';
import * as logger from 'winston';
import { BitcoinBlockchainService } from '../services/blockchain/bitcoin';
import { AvailableNetwork } from '../types';

export abstract class CompatibleBitcoinTransactionSender extends Job {
    protected networkId: AvailableNetwork;

    private daos: Hashtable<Dao<any>>;
    private blockchainService: BitcoinBlockchainService;
    private sendFromAddress: string;
    private privateKey: Buffer;

    constructor(
        pluginManager: PluginManager,
        sendFromAddress: string,
        privateKey: Buffer,
        networkId: AvailableNetwork
    ) {
        super(pluginManager);

        this.networkId = networkId;
        this.sendFromAddress = sendFromAddress;
        this.privateKey = privateKey;
    }

    public async init() {
        this.daos = await this.pluginManager.get('mongodb').getDaos() as Hashtable<Dao<any>>;

        this.blockchainService = await this.prepareBlockchainService();
    }

    public async execute() {
        const transactionDao = this.daos.transactions as TransactionDao;
        const transactions = await transactionDao.listByNetworkAndStatus(
            this.blockchainService.getBlockchainId(),
            this.blockchainService.getNetworkId(),
            Scheme.TransactionStatus.Created
        );

        for (const transaction of transactions) {
            logger.info(`${this.getJobId()}: send transaction`, transaction);

            if (!transaction.ref.from[0].address) {
                transaction.ref.from[0].address = this.sendFromAddress;
            }

            let tx: Transaction;

            try {
                tx = await this.blockchainService.sendTransaction(
                    this.privateKey,
                    {
                        fee: transaction.ref.fee,
                        from: transaction.ref.from,
                        hash: transaction.ref.hash,
                        to: transaction.ref.to,
                    }
                );
            }
            catch (error) {
                logger.error(`transaction sending failed ${transaction.uniqId}`, error);
                throw error;
            }

            logger.info(`${this.getJobId()}: transaction sent`, {
                transaction,
                tx
            });

            await transactionDao.setHashAndStatus(
                transaction.id,
                tx.hash,
                Scheme.TransactionStatus.Sent
            );
        }
    }

    protected abstract async prepareBlockchainService(): Promise<BitcoinBlockchainService>;
}
