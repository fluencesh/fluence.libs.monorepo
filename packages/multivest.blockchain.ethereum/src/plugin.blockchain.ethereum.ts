import { Plugin } from '@applicature/multivest.core';
import { EthereumTxMiningListener } from './jobs/eth.tx.mining.listener';
import { EthereumTransactionSender } from './jobs/eth.tx.sender';

class EthereumBlockchainPlugin extends Plugin<any> {
    public getPluginId() {
        return 'blockchain.ethereum';
    }

    public init() {
        this.registerJob(EthereumTxMiningListener);
        this.registerJob(EthereumTransactionSender);
    }
}

export { EthereumBlockchainPlugin as Plugin };
