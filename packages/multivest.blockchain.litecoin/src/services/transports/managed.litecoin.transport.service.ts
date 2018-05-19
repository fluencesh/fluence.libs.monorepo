import { ManagedBitcoinTransportService } from '@applicature-restricted/multivest.blockchain.bitcoin';
import {
    ManagedBlockchainTransportService,
    Scheme,
    TransportConnectionService,
} from '@applicature-restricted/multivest.services.blockchain';
import { Hashtable, MultivestError, PluginManager, Service } from '@applicature/multivest.core';
import { LITECOIN } from '../../constants';
import { BcLitecoinTransportService } from './bc.litecoin.transport.service';
import { LitecoinTransport } from './litecoin.transport';

export class ManagedLitecoinTransportService extends ManagedBitcoinTransportService implements LitecoinTransport {
    protected transportServices: Array<LitecoinTransport>;
    protected reference: LitecoinTransport;

    public getBlockchainId() {
        return LITECOIN;
    }

    public getServiceId() {
        return `managed.litecoin.${ this.networkId }.transport.service`;
    }

    public getTransportId() {
        return `managed.litecoin.${ this.networkId }.transport.service`;
    }

    protected prepareTransportServices(connections: Array<Scheme.TransportConnection>): Array<LitecoinTransport> {
        return connections.map((con) => new BcLitecoinTransportService(this.pluginManager, con));
    }
}
