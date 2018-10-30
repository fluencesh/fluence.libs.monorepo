import { BlockchainListener } from '@applicature-restricted/multivest.blockchain';
import { Hashtable } from '@applicature/core.plugin-manager';
import {Scheme, TransactionDao} from '@fluencesh/fluence.lib.services';
import { Plugin as MongoPlugin } from '@applicature/core.mongodb';
import * as logger from 'winston';

export abstract class CompatibleBitcoinTxMiningListener extends BlockchainListener {
    public async processBlock(block: Scheme.BlockchainBlock) {
        const txMapping: Hashtable<Scheme.BlockchainTransaction> = {};
        const mongoPlugin = this.pluginManager.get('mongodb') as MongoPlugin;
        const transactionDao = await mongoPlugin.getDao('transactions') as TransactionDao;

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
                    block: {
                        hash: block.hash,
                        number: block.height,
                        timestamp: block.time,
                    },
                    txHash: tx.hash,
                });

                await transactionDao.setMinedBlock(
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
