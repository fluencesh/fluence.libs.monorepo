import { BcBitcoinTransportService } from '@applicature-restricted/multivest.blockchain.bitcoin';
import { MultivestError } from '@applicature/multivest.core';
import {
    HDNode,
    networks as BitcoinLibNetworks,
} from 'bitcoinjs-lib';
import * as config from 'config';
import { AvailableNetwork } from '../../constants';
import { Errors } from '../../errors';

export class BcLitecoinTransportService extends BcBitcoinTransportService {
    public getServiceId() {
        return `bitcoin.core.litecoin.${ this.networkId }.transport.service`;
    }

    public getTransportId() {
        return `bitcoin.core.litecoin.${ this.networkId }.transport.service`;
    }

    public async getHDAddress(index: number): Promise<string> {
        const masterPubKey = config.has('multivest.blockchain.litecoin.hd.masterPublicKey')
            ? config.get<string>('multivest.blockchain.litecoin.hd.masterPublicKey')
            : null;

        if (!masterPubKey) {
            throw new MultivestError(Errors.MASTER_PUBLIC_KEY_REQUIRED);
        }

        const hdNode = HDNode.fromBase58(masterPubKey, BitcoinLibNetworks.litecoin);

        return hdNode.derive(0).derive(index).getAddress().toString();
    }
}
