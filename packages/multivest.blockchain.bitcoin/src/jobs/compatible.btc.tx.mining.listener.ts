import * as logger from 'winston';
import { Hashtable } from '@applicature/multivest.core';
import { Block, BlockchainListener, Transaction } from '@applicature/multivest.blockchain';
import { TransactionDao, Scheme } from '@applicature/multivest.mongodb.ico';

export abstract class CompatibleBitcoinTxMiningListener extends BlockchainListener {

    async processBlock(block: Block) {
        const txMapping: Hashtable<Transaction> = {};
        const transactionDao = this.daos.transactions as TransactionDao;

        for (const tx of block.transactions) {
            txMapping[tx.hash] = tx;
        }

        if (block.transactions.length === 0) {
            return;
        }

        const transactions = await transactionDao.listByNetworkAndStatus(
            this.blockchainService.getBlockchainId(), 
            Scheme.TransactionStatus.Sent
        );

        for (const transaction of transactions) {
            if (txMapping.hasOwnProperty(transaction.ref.hash)) {
                const tx = txMapping[transaction.ref.hash];

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