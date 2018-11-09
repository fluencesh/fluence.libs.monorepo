import { MultivestError, PluginManager, Service } from '@applicature-private/core.plugin-manager';
import { Errors } from '../../errors';
import { Scheme } from '../../types';
import { BlockchainService } from './blockchain.service';
import { ManagedBlockchainTransportService, BlockchainTransportProvider } from '../transports';

type Transaction = Scheme.BlockchainTransaction;
type Block = Scheme.BlockchainBlock<Transaction>;
type Provider = BlockchainTransportProvider<Transaction, Block>;
type ManagedTransport = ManagedBlockchainTransportService<Transaction, Block, Provider>;
type BlockchainServiceType = BlockchainService<Transaction, Block, Provider, ManagedTransport>;

export class BlockchainRegistryService extends Service {
    private registry: Map<Scheme.BlockchainInfo, BlockchainServiceType>;

    constructor(pluginManager: PluginManager) {
        super(pluginManager);

        this.registry = new Map();
    }

    public getServiceId() {
        return 'blockchain.registry.service';
    }

    public register(blockchainService: BlockchainServiceType): void {
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

    public getByBlockchainInfo<T extends BlockchainServiceType>(blockchainId: string, networkId: string): T {
        for (const [ key, value ] of this.registry) {
            if (key.blockchainId === blockchainId && key.networkId === networkId) {
                return value as T;
            }
        }

        throw new MultivestError(Errors.BLOCKCHAIN_SERVICE_DOES_NOT_IN_REGISTRY);
    }

    public listByBlockchainId<T extends BlockchainServiceType>(blockchainId: string): Array<T> {
        const services = [] as Array<T>;

        for (const [ key, value ] of this.registry) {
            if (key.blockchainId === blockchainId) {
                services.push(value as T);
            }
        }

        return services;
    }

    private generateKey(blockchainId: string, networkId: string): Scheme.BlockchainInfo {
        return { blockchainId, networkId };
    }
}
