import { CompatibleBitcoinTransactionSender } from '@applicature-restricted/multivest.blockchain.bitcoin';
import { PluginManager } from '@applicature/multivest.core';
import * as config from 'config';
import { AvailableNetwork } from '../constants';
import { LitecoinBlockchainService } from '../services/blockchain/litecoin';
import { ManagedLitecoinTransportService } from '../services/transports/managed.litecoin.transport.service';

const JOB_ID = 'ltc.tx.sender';

export class LitecoinTransactionSender extends CompatibleBitcoinTransactionSender {
    public getJobId() {
        return JOB_ID;
    }

    protected async prepareBlockchainService(): Promise<LitecoinBlockchainService> {
        const transportService = new ManagedLitecoinTransportService(this.pluginManager, this.networkId);
        await transportService.init();

        return new LitecoinBlockchainService(this.pluginManager, transportService);
    }
}
