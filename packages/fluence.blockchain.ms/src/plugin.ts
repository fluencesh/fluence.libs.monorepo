import { Plugin } from '@fluencesh/multivest.core';
import { BlockchainMetricService, CronjobMetricService } from './services';

class FluenceBlockchainMs extends Plugin<void> {
    public getPluginId() {
        return 'fluence.blockchain.ms.plugin';
    }

    public init(): void {
        this.registerService(BlockchainMetricService);
        this.registerService(CronjobMetricService);
    }
}

export { FluenceBlockchainMs as Plugin };
