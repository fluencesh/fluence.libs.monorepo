import {
    ManagedBlockchainTransportService,
    Scheme,
    TransportConnectionService,
} from '@applicature-restricted/multivest.services.blockchain';
import { Hashtable, MultivestError, PluginManager, Service } from '@applicature/multivest.core';
import * as Ajv from 'ajv';
import { BITCOIN } from '../../constants';
import { Errors } from '../../errors';
import { AvailableNetwork } from '../../types';
import { BcBitcoinTransportService } from './bc.bitcoin.transport';
import { BiBitcoinTransportService } from './bi.bitcoin.transport';
import { BitcoinTransport } from './bitcoin.transport';

const ajv = new Ajv({ removeAdditional: false, useDefaults: true, coerceTypes: true });
ajv.addSchema({
    type: 'object',

    additionalProperties: true,
    properties: {
        networkId: { type: 'string' },
        settings: {
            type: 'object',

            additionalProperties: true,
            properties: {
                host: { type: 'string' },
                network: { type: 'string' },
                password: { type: 'string' },
                username: { type: 'string' },
            },
            required: [ 'host', 'network', 'password', 'username' ]
        },
    },
    required: [ 'networkId', 'settings' ]
}, 'bitcoin.core.transport.config.scheme');

ajv.addSchema({
    type: 'object',

    additionalProperties: true,
    properties: {
        networkId: { type: 'string' },
        settings: {
            type: 'object',

            additionalProperties: true,
            properties: {
                apiKey: { type: 'string' },
                url: { type: 'string' },
                wallet: {
                    type: 'object',

                    additionalProperties: true,
                    properties: {
                        id: { type: 'string' }
                    },
                    required: ['id']
                },
            },
            required: [ 'url' ]
        },
    },
    required: [ 'networkId', 'settings' ]
}, 'bitcoin.info.transport.config.scheme');

export class ManagedBitcoinTransportService extends ManagedBlockchainTransportService implements BitcoinTransport {
    protected transportServices: Array<BitcoinTransport>;
    protected reference: BitcoinTransport;

    public getBlockchainId() {
        return BITCOIN;
    }

    public getServiceId() {
        return `managed.bitcoin.${ this.networkId }.transport.service`;
    }

    public getTransportId() {
        return `managed.bitcoin.${ this.networkId }.transport.service`;
    }

    public async getHDAddress(index: number) {
        const activeTransport = await this.getActiveTransportService();

        return activeTransport.getHDAddress(index);
    }

    public isValidAddress(address: string) {
        return this.transportServices[0].isValidAddress(address);
    }

    protected prepareTransportServices(connections: Array<Scheme.TransportConnection>): Array<BitcoinTransport> {
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

    protected async getActiveTransportService(): Promise<BitcoinTransport> {
        const activeTransport = await super.getActiveTransportService();

        return activeTransport as BitcoinTransport;
    }
}
