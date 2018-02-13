import * as Client from 'bitcoin-core';
import * as bitcoin from 'bitcoinjs-lib';
import * as config from 'config';

import * as BitcoinjsTestnets from 'bitcoinjs-testnets';

BitcoinjsTestnets.register(bitcoin.networks);


import { BlockchainService } from '@applicature-restricted/multivest.blockchain';
import { BitcoinBlockchainService } from '@applicature-restricted/multivest.blockchain.bitcoin';

export class LitecoinBlockchainService extends BitcoinBlockchainService {
    // private client: Client;
    // private network: any;
    // private masterPublicKey: string;

    constructor(fake?: boolean) {
        super();

        if (!!fake === false) {
            this.client = new Client(config.get('multivest.blockchain.litecoin.providers.native'));
        }

        this.network = bitcoin.networks[config.get('multivest.blockchain.litecoin.network')];
        this.masterPublicKey = config.get('multivest.blockchain.litecoin.hd.masterPublicKey');
    }

    public getBlockchainId() {
        return 'LITECOIN';
    }

    public getSymbol() {
        return 'LTC';
    }
}
