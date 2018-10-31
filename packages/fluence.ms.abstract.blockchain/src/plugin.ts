import { Plugin } from '@applicature-private/core.plugin-manager';
import { BlockchainMonitorRegistry } from './blockchain';
import { BlockchainMetricService } from './services';

class FluenceBlockchainMs extends Plugin<void> {
    public getPluginId() {
        return 'fluence.blockchain.ms.plugin';
    }

    public init(): void {
        this.registerService(BlockchainMetricService);
        this.registerService(BlockchainMonitorRegistry);
    }
}

export { FluenceBlockchainMs as Plugin };
