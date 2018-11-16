import {
    ManagedBlockchainTransportService,
    Scheme,
} from '@applicature-private/fluence.lib.services';
import * as Ajv from 'ajv';
import { BITCOIN, BitcoinInfoTransportConfigScheme, BitcoinCoreTransportConfigScheme } from '../../constants';
import { BcBitcoinTransportService } from './bc.bitcoin.transport';
import { BiBitcoinTransportService } from './bi.bitcoin.transport';
import { BitcoinTransaction, BitcoinBlock } from '../../types';
import { BitcoinTransportProvider, ManagedBitcoinTransport } from './interfaces';

const ajv = new Ajv({ removeAdditional: false, useDefaults: true, coerceTypes: true });
ajv.addSchema(BitcoinCoreTransportConfigScheme, 'bitcoin.core.transport.config.scheme');
ajv.addSchema(BitcoinInfoTransportConfigScheme, 'bitcoin.info.transport.config.scheme');

export class ManagedBitcoinTransportService
    extends ManagedBlockchainTransportService<BitcoinTransaction, BitcoinBlock, BitcoinTransportProvider>
    implements ManagedBitcoinTransport {

    public getBlockchainId() {
        return BITCOIN;
    }

    public getServiceId() {
        return `managed.bitcoin.${ this.networkId }.transport.service`;
    }

    public getTransportId() {
        return `managed.bitcoin.${ this.networkId }.transport.service`;
    }

    protected prepareTransportServices(
        connections: Array<Scheme.TransportConnection>
    ): Array<BitcoinTransportProvider> {
        return connections.map((con) => {
            if (ajv.validate('bitcoin.info.transport.config.scheme', con)) {
                return new BiBitcoinTransportService(this.pluginManager, con);
            } else if (ajv.validate('bitcoin.core.transport.config.scheme', con)) {
                return new BcBitcoinTransportService(this.pluginManager, con);
            } else {
                return null;
            }
        });
    }
}
