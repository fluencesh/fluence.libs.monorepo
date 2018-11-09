import { MultivestError, PluginManager, Service } from '@applicature-private/core.plugin-manager';
import { Errors } from '../../errors';
import { Scheme } from '../../types';
import { BlockchainService } from './blockchain.service';
import { ManagedBlockchainTransportService } from '../transports';

export class BlockchainRegistryService extends Service {
    private registry: Map<Scheme.BlockchainInfo, BlockchainService<any, any, any>>;

    constructor(pluginManager: PluginManager) {
        super(pluginManager);

        this.registry = new Map();
    }

    public getServiceId() {
        return 'blockchain.registry.service';
    }

    public register<
        BlockchainServiceType extends BlockchainService<
            Scheme.BlockchainTransaction,
            Scheme.BlockchainBlock<Scheme.BlockchainTransaction>,
            ManagedBlockchainTransportService<
                Scheme.BlockchainTransaction,
                Scheme.BlockchainBlock<Scheme.BlockchainTransaction>
            >
        >
    >(blockchainService: BlockchainServiceType): void {
        const blockchainId = blockchainService.getBlockchainId();
        const networkId = blockchainService.getNetworkId();

        const key = this.generateKey(blockchainId, networkId);

        this.registry.set(key, blockchainService);
    }

    public hasBlockchainService(blockchainId: string, networkId: string): boolean {
        for (const [ key ] of this.registry) {
            if (key.blockchainId === blockchainId && key.networkId === networkId) {
                return true;
            }
        }

        return false;
    }

    public getByBlockchainInfo<
        BlockchainServiceType extends BlockchainService<
            Scheme.BlockchainTransaction,
            Scheme.BlockchainBlock<Scheme.BlockchainTransaction>,
            ManagedBlockchainTransportService<
                Scheme.BlockchainTransaction,
                Scheme.BlockchainBlock<Scheme.BlockchainTransaction>
            >
        >
    >(blockchainId: string, networkId: string): BlockchainServiceType {
        for (const [ key, value ] of this.registry) {
            if (key.blockchainId === blockchainId && key.networkId === networkId) {
                return value as BlockchainServiceType;
            }
        }

        throw new MultivestError(Errors.BLOCKCHAIN_SERVICE_DOES_NOT_IN_REGISTRY);
    }

    public listByBlockchainId<
        BlockchainServiceType extends BlockchainService<
            Scheme.BlockchainTransaction,
            Scheme.BlockchainBlock<Scheme.BlockchainTransaction>,
            ManagedBlockchainTransportService<
                Scheme.BlockchainTransaction,
                Scheme.BlockchainBlock<Scheme.BlockchainTransaction>
            >
        >
    >(blockchainId: string): Array<BlockchainServiceType> {
        const services = [] as Array<BlockchainServiceType>;

        for (const [ key, value ] of this.registry) {
            if (key.blockchainId === blockchainId) {
                services.push(value as BlockchainServiceType);
            }
        }

        return services;
    }

    private generateKey(blockchainId: string, networkId: string): Scheme.BlockchainInfo {
        return { blockchainId, networkId };
    }
}
