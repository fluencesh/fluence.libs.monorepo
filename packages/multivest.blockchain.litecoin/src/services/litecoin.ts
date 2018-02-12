import * as Client from 'bitcoin-core';
import * as bitcoin from 'bitcoinjs-lib';
import * as config from 'config';

import { BlockchainService } from '@applicature-restricted/multivest.blockchain';
import { BitcoinBlockchainService } from '@applicature-restricted/multivest.blockchain.bitcoin';

export class LitecoinService extends BitcoinBlockchainService {
    // private client: Client;
    // private network: any;
    // private masterPublicKey: string;

    constructor(fake?: boolean) {
        super();

        if (!!fake === false) {
            this.client = new Client(config.get('multivest.blockchain.litecoin.providers.native'));
        }

        this.network = bitcoin.networks.litecoin;
        this.masterPublicKey = config.get('multivest.blockchain.litecoin.hd.masterPublicKey');
    }

    public getBlockchainId() {
        return 'LITECOIN';
    }

    public getSymbol() {
        return 'LTC';
    }
}
