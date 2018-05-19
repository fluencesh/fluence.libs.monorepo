import { CompatibleBitcoinTxMiningListener } from '@applicature-restricted/multivest.blockchain.bitcoin';

export class LitecoinTxMiningListener extends CompatibleBitcoinTxMiningListener {
    public getJobId() {
        return 'ltc.tx.mining.listener';
    }
}
