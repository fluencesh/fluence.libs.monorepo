import { MultivestError, PluginManager, Service } from '@applicature-private/multivest.core';
import { Errors } from '../../errors';
import { Scheme } from '../../types';
import { BlockchainService } from './blockchain.service';

export class BlockchainRegistryService extends Service {
    private registry: Map<Scheme.BlockchainInfo, BlockchainService>;

    constructor(pluginManager: PluginManager) {
        super(pluginManager);

        this.registry = new Map();
    }

    public getServiceId() {
        return 'blockchain.registry.service';
    }

    public register(blockchainId: string, networkId: string, blockchainService: BlockchainService): void {
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

    public getByBlockchainInfo<T extends BlockchainService>(
        blockchainId: string,
        networkId: string
    ): T {
        for (const [ key, value ] of this.registry) {
            if (key.blockchainId === blockchainId && key.networkId === networkId) {
                return value as T;
            }
        }

        throw new MultivestError(Errors.BLOCKCHAIN_SERVICE_DOES_NOT_IN_REGISTRY);
    }

    public listByBlockchainId<T extends BlockchainService>(blockchainId: string): Array<T> {
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
