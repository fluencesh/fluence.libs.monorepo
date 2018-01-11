import * as logger from 'winston';
import { Block, BlockchainListener, Hashtable, Transaction } from '@applicature/multivest.core';
import { TransactionDao, TransactionStatus } from '@applicature/multivest.mongodb.ico';

export abstract class CompatibleBitcoinTxMiningListener extends BlockchainListener {

    async processBlock(block: Block) {
        const txMapping: Hashtable<Transaction> = {};
        const transactionDao = this.dao.transactions as TransactionDao;

        for (const tx of block.transactions) {
            txMapping[tx.hash] = tx;
        }

        if (block.transactions.length === 0) {
            return;
        }

        const transactions = await transactionDao.listByNetworkAndStatus(
            this.blockchainService.getBlockchainId(), 
            TransactionStatus.Sent
        );

        for (const transaction of transactions) {
            if (txMapping.hasOwnProperty(transaction.tx.hash)) {
                const tx = txMapping[transaction.tx.hash];

                logger.info(`${this.blockchainService.getBlockchainId()}: setting transaction mined block`, {
                    txHash: tx.hash,
                    block: {
                        hash: block.hash,
                        number: block.height,
                        timestamp: block.time,
                    },
                });

                await transactionDao.setMinedBlock(
                    this.blockchainService.getBlockchainId(),
                    tx.hash,
                    block.hash,
                    block.height,
                    block.time,
                );
            }
        }
    }
}