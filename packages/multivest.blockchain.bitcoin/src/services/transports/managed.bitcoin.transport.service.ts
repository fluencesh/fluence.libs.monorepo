import {
    ManagedBlockchainTransportService,
    Scheme,
    TransportConnectionService,
} from '@applicature-restricted/multivest.services.blockchain';
import { Hashtable, MultivestError, PluginManager, Service } from '@applicature/multivest.core';
import { BITCOIN } from '../../constants';
import { Errors } from '../../errors';
import { BiBitcoinTransportService } from './bi.bitcoin.transport';
import { BitcoinTransport } from './bitcoin.transport';

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

    protected prepareTransportServices(connections: Array<Scheme.TransportConnection>) {
        return connections.map((con) => new BiBitcoinTransportService(this.pluginManager, con));
    }

    protected async getActiveTransportService(): Promise<BitcoinTransport> {
        const activeTransport = await super.getActiveTransportService();

        return activeTransport as BitcoinTransport;
    }
}
