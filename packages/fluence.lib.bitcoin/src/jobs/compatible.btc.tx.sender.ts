// FIXME:
// - remove old packs
// - use new packs
// - fix incompatible parts of code

// import { Dao, Hashtable, Job, PluginManager } from '@applicature/core.plugin-manager';
// import { Scheme, TransactionDao } from '@applicature/fluence.lib.services';
// import * as logger from 'winston';
// import { BitcoinBlockchainService } from '../services/blockchain/bitcoin';

// export abstract class CompatibleBitcoinTransactionSender extends Job {
//     constructor(
//         pluginManager: PluginManager,
//         private blockchainService: BitcoinBlockchainService,
//         private sendFromAddress: string
//     ) {
//         super(pluginManager);
//     }

//     public async execute() {
//         const transactionDao = this.pluginManager.getDaoByClass(TransactionDao);
//         const transactions = await transactionDao.listByNetworkAndStatus(
//             this.blockchainService.getBlockchainId(),
//             Scheme.TransactionStatus.Created
//         );

//         for (const transaction of transactions) {
//             logger.info(`${this.getJobId()}: send transaction`, transaction);

//             if (!transaction.ref.from[0].address) {
//                 transaction.ref.from[0].address = this.sendFromAddress;
//             }

//             let txHash;

//             try {
//                 txHash = await this.blockchainService.sendTransaction({
//                     fee: transaction.ref.fee,
//                     from: transaction.ref.from,
//                     hash: transaction.ref.hash,
//                     to: transaction.ref.to,
//                 });
//             }
//             catch (error) {
//                 logger.error(`transaction sending failed ${transaction.uniqId}`, error);
//                 throw error;
//             }

//             logger.info(`${this.getJobId()}: transaction sent`, {
//                 transaction,
//                 txHash,
//             });

//             await transactionDao.setHashAndStatus(
//                 transaction.id,
//                 txHash,
//                 Scheme.TransactionStatus.Sent
//             );
//         }
//     }
// }
