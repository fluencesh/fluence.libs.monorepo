import { Scheme } from '@applicature-restricted/multivest.services.blockchain';
import { PluginManager } from '@applicature/multivest.core';
import * as config from 'config';
import { BitcoinBlockchainService } from '../services/blockchain/bitcoin';
import { BitcoinTransport } from '../services/transports/bitcoin.transport';
import { ManagedBitcoinTransportService } from '../services/transports/managed.bitcoin.transport.service';
import { AvailableNetwork } from '../types';
import { CompatibleBitcoinTransactionSender } from './compatible.btc.tx.sender';

export class BitcoinTransactionSender extends CompatibleBitcoinTransactionSender {
    public getJobId() {
        return 'btc.tx.sender';
    }

    protected async prepareBlockchainService(): Promise<BitcoinBlockchainService> {
        const transportService = new ManagedBitcoinTransportService(this.pluginManager, this.networkId);
        await transportService.init();

        return new BitcoinBlockchainService(this.pluginManager, transportService);
    }
}
