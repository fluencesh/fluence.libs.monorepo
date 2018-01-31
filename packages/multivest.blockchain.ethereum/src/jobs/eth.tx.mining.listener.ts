import { BlockchainListener } from '@applicature-restricted/multivest.blockchain';
import { Block, Hashtable, PluginManager } from '@applicature/multivest.core';
import { Scheme, TransactionDao } from '@applicature/multivest.mongodb.ico';
import * as config from 'config';
import * as logger from 'winston';
import { EthereumBlockchainService } from '../services/blockchain/ethereum';
import { EthereumTransaction } from '../services/blockchain/model';

export class EthereumTxMiningListener extends BlockchainListener {
    private transactionDao: TransactionDao;

    constructor(pluginManager: PluginManager) {
        super(
            pluginManager,
            new EthereumBlockchainService(),
            config.get('multivest.blockchain.ethereum.listener.sinceBlock'),
            config.get('multivest.blockchain.ethereum.listener.minConfirmations')
        );

        this.transactionDao = pluginManager.getDao('transactions') as TransactionDao;
    }

    public getJobId() {
        return 'eth.tx.mining.listener';
    }

    public async processBlock(block: Block) {
        const txMapping: Hashtable<EthereumTransaction> = {};

        for (const tx of block.transactions) {
            txMapping[tx.hash] = tx as EthereumTransaction;
        }

        if (block.transactions.length === 0) {
            return;
        }

        const transactions = await this.transactionDao.listByNetworkAndStatus(
            this.blockchainService.getBlockchainId(),
            Scheme.TransactionStatus.Sent
        );

        for (const transaction of transactions) {
            if (txMapping.hasOwnProperty(transaction.ref.hash)) {
                const tx = txMapping[transaction.ref.hash];

                logger.info(`${this.blockchainService.getBlockchainId()}: setting ethereum transaction mined block`, {
                    block: {
                        hash: block.hash,
                        number: block.height,
                        timestamp: block.time
                    },
                    txHash: tx.hash,
                });

                await this.transactionDao.setMinedBlock(
                    this.blockchainService.getBlockchainId(),
                    tx.hash,
                    block.hash,
                    block.height,
                    block.time
                );
            }
        }
    }
}
