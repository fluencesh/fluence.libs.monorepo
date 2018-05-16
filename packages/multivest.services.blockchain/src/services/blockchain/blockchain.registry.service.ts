import { Hashtable, PluginManager, Service } from '@applicature/multivest.core';
import { TransportConnectionService } from '../object/transport.connection.service';
import { ManagedBlockchainTransportService } from '../transports/managed.blockchain.transport.service';
import { BlockchainService } from './blockchain.service';

export class BlockchainRegistryService extends Service {
    private registry: Hashtable<BlockchainService>;
    private transportConnectionService: TransportConnectionService;

    constructor(pluginManager: PluginManager) {
        super(pluginManager);

        this.registry = {};
        this.transportConnectionService = new TransportConnectionService(pluginManager);
    }

    public getServiceId() {
        return 'blockchain.registry.service';
    }

    public register(blockchainId: string, networkId: string, blockchainService: BlockchainService): void {
        this.registry[this.generateBlockchainServiceName(blockchainId, networkId)] = blockchainService;
    }

    public hasBlockchainService(blockchainId: string): boolean {
        return this.registry.hasOwnProperty(blockchainId);
    }

    public getBlockchainService(
        blockchainId: string,
        networkId: string,
        blockchainServiceType: typeof BlockchainService
    ): BlockchainService {
        const blockchainServiceId = this.generateBlockchainServiceName(blockchainId, networkId);

        if (!this.hasBlockchainService(blockchainServiceId)) {
            const blockchainServices: Array<BlockchainService> =
                this.pluginManager.getServicesByClass(blockchainServiceType as any) as Array<BlockchainService>;

            const blockchainService = blockchainServices.find((bs) =>
                bs.getBlockchainId() === blockchainId
                && bs.getNetworkId() === networkId
            );

            if (blockchainService) {
                this.registry[this.generateBlockchainServiceName(blockchainId, networkId)] = blockchainService;
            }
        }

        return this.registry[blockchainServiceId];
    }

    private generateBlockchainServiceName(blockchainId: string, networkId: string) {
        return `${blockchainId}.${networkId}`;
    }
}
