import {
    ManagedBlockchainTransportService,
    Scheme,
} from '@fluencesh/fluence.lib.services';
import { BcLitecoinTransportService } from './bc.litecoin.transport';
import { LitecoinBlock, LitecoinTransaction } from '../../types';
import { LitecoinTransportProvider, ManagedLitecoinTransport } from './interfaces';
import { LITECOIN } from '../../constants';

export class ManagedLitecoinTransportService
    extends ManagedBlockchainTransportService<LitecoinTransaction, LitecoinBlock, LitecoinTransportProvider>
    implements ManagedLitecoinTransport {

    public getBlockchainId() {
        return LITECOIN;
    }

    public getServiceId() {
        return `managed.litecoin.${ this.networkId }.transport.service`;
    }

    public getTransportId() {
        return `managed.litecoin.${ this.networkId }.transport.service`;
    }

    protected prepareTransportServices(
        connections: Array<Scheme.TransportConnection>
    ): Array<LitecoinTransportProvider> {
        return connections.map((con) => new BcLitecoinTransportService(this.pluginManager, con));
    }
}
