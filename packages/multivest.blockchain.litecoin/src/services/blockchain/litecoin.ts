import * as Client from 'bitcoin-core';
import * as bitcoin from 'bitcoinjs-lib';
import * as config from 'config';

import { BlockchainService } from '@applicature-restricted/multivest.blockchain';
import { BitcoinBlockchainService } from '@applicature-restricted/multivest.blockchain.bitcoin';
import { MultivestError, PluginManager } from '@applicature/multivest.core';
import { AvailableNetwork, LITECOIN } from '../../constants';
import { LitecoinTransport } from '../transports/litecoin.transport';

export class LitecoinBlockchainService extends BitcoinBlockchainService {
    protected blockchainTransport: LitecoinTransport;

    constructor(pluginManager: PluginManager, blockchainTransport: LitecoinTransport) {
        super(pluginManager, blockchainTransport);
    }

    public getBlockchainId() {
        return LITECOIN;
    }

    public getSymbol() {
        return 'LTC';
    }

    public isValidNetwork(network: string) {
        return AvailableNetwork.LITECOIN === network || AvailableNetwork.TEST_NET === network;
    }
}
