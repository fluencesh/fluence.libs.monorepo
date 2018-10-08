import { Block, Hashtable, Transaction } from '@fluencesh/multivest.core';
import { Plugin as MongoPlugin } from '@fluencesh/multivest.mongodb';
import {
    BlockchainListener,
    Scheme,
    TransactionDao,
} from '@fluencesh/multivest.services.blockchain';
import * as logger from 'winston';

export class CompatibleBitcoinTxMiningListener extends BlockchainListener {
    public getJobId() {
        return 'compatible.bitcoin.tx.mining.listener';
    }

    public async processBlock(publishedBlockHeight: number, block: Block) {
        const txMapping: Hashtable<Transaction> = {};
        const mongoPlugin = this.pluginManager.get('mongodb') as any as MongoPlugin;
        const transactionDao = await mongoPlugin.getDao('transactions') as TransactionDao;

        for (const tx of block.transactions) {
            txMapping[tx.hash] = tx;
        }

        if (block.transactions.length === 0) {
            return;
        }

        const transactions = await transactionDao.listByNetworkAndStatus(
            this.blockchainService.getBlockchainId(),
            this.blockchainService.getNetworkId(),
            Scheme.TransactionStatus.Sent
        );

        for (const transaction of transactions) {
            if (txMapping.hasOwnProperty(transaction.ref.hash)) {
                const tx = txMapping[transaction.ref.hash];

                logger.info(`${this.blockchainService.getBlockchainId()}: setting transaction mined block`, {
                    block: {
                        hash: block.hash,
                        number: block.height,
                        timestamp: block.time,
                    },
                    txHash: tx.hash,
                });

                await transactionDao.setMinedBlock(
                    this.blockchainService.getBlockchainId(),
                    this.blockchainService.getNetworkId(),
                    tx.hash,
                    block.hash,
                    block.height,
                    block.time
                );
            }
        }
    }
}
