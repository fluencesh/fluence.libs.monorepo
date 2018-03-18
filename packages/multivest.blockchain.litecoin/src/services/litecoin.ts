import * as Client from 'bitcoin-core';
import * as bitcoin from 'bitcoinjs-lib';
import * as config from 'config';

import * as BitcoinjsTestnets from 'bitcoinjs-testnets';

BitcoinjsTestnets.register(bitcoin.networks);


import { BlockchainService } from '@applicature-restricted/multivest.blockchain';
import { BitcoinBlockchainService } from '@applicature-restricted/multivest.blockchain.bitcoin';
import {MultivestError} from '@applicature/multivest.core';

export class LitecoinBlockchainService extends BitcoinBlockchainService {
    // private client: Client;
    // private network: any;
    // private masterPublicKey: string;

    constructor(fake?: boolean, networkName?: string, masterPublicKey?: string) {
        super();

        if (!!fake === false) {
            this.client = new Client(config.get('multivest.blockchain.litecoin.providers.native'));
        }

        networkName = networkName || config.get('multivest.blockchain.litecoin.network');
        this.network = bitcoin.networks[networkName];

        if (networkName === 'litecoin_testnet') {
            this.network.bip32 = {
                private: 0x0436ef7d,
                public: 0x0436f6e1,
            };
        }

        this.masterPublicKey = masterPublicKey || config.get('multivest.blockchain.litecoin.hd.masterPublicKey');
    }

    public getHDAddress(index: number) {
        let hdNode;

        if (this.masterPublicKey.startsWith('Ltub')) {
            hdNode = bitcoin.HDNode.fromBase58(this.masterPublicKey, bitcoin.networks.litecoin);
        }
        else if (this.masterPublicKey.startsWith('xpub')) {
            hdNode = bitcoin.HDNode.fromBase58(this.masterPublicKey, bitcoin.networks.bitcoin);
            hdNode.keyPair.network = bitcoin.networks.litecoin;
        }
        else if (this.masterPublicKey.startsWith('ttub')) {
            hdNode = bitcoin.HDNode.fromBase58(this.masterPublicKey, bitcoin.networks.litecoin_testnet);
        }
        else {
            throw new MultivestError('UNKNOWN_LITECOIN_FORMAT');
        }

        return hdNode.derive(0).derive(index).getAddress().toString();
    }

    public getBlockchainId() {
        return 'LITECOIN';
    }

    public getSymbol() {
        return 'LTC';
    }
}
