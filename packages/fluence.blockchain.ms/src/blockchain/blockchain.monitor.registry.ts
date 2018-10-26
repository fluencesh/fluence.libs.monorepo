import { MultivestError, PluginManager, Service } from '@applicature-private/multivest.core';
import { Scheme } from '@applicature-private/multivest.services.blockchain';
import { Errors } from '../errors';
import { BlockchainMonitor } from './blockchain.monitor';

export class BlockchainMonitorRegistry extends Service {
    private registry: Map<Scheme.BlockchainInfo, BlockchainMonitor>;

    constructor(pluginManager: PluginManager) {
        super(pluginManager);

        this.registry = new Map();
    }

    public getServiceId() {
        return 'blockchain.monitor.registry';
    }

    public addBlockchainMonitor(blockchainId: string, networkId: string, blockchainMonitor: BlockchainMonitor): void {
        const key = this.generateKey(blockchainId, networkId);
        this.registry.set(key, blockchainMonitor);
    }

    public getBlockchainMonitor(blockchainId: string, networkId: string): BlockchainMonitor {
        const key = this.generateKey(blockchainId, networkId);
        const blockchainMonitor = this.registry.get(key);

        if (!blockchainMonitor) {
            throw new MultivestError(Errors.BLOCKCHAIN_MONITOR_NOT_FOUND);
        }

        return blockchainMonitor;
    }

    public async executeMonitorsByBlockchainInfo(blockchainId: string, networkId?: string): Promise<void> {
        const executionPromises = [];

        for (const [ blockchainInfo, monitor ] of this.registry) {
            if (
                blockchainInfo.blockchainId === blockchainId
                && (!networkId || networkId && blockchainInfo.networkId === networkId)
            ) {
                executionPromises.push(monitor.execute());
            }
        }

        await Promise.all(executionPromises);
    }

    public generateKey(blockchainId: string, networkId: string): Scheme.BlockchainInfo {
        return { blockchainId, networkId };
    }
}
