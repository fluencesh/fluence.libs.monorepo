import { Plugin } from '@applicature/core.plugin-manager';
import { BlockchainMetricService } from './services';

class FluenceBlockchainMs extends Plugin<void> {
    public getPluginId() {
        return 'fluence.blockchain.ms.plugin';
    }

    public init(): void {
        this.registerService(BlockchainMetricService);
    }
}

export { FluenceBlockchainMs as Plugin };
