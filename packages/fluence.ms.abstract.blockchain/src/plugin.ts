import { Plugin } from '@applicature/synth.plugin-manager';
import { BlockchainMetricService, CronjobMetricService, ScheduledTxHandlerService } from './services';

class FluenceBlockchainMs extends Plugin<void> {
    public getPluginId() {
        return 'fluence.blockchain.ms.plugin';
    }

    public init(): void {
        this.registerService(BlockchainMetricService);
        this.registerService(CronjobMetricService);
        this.registerService(ScheduledTxHandlerService);
    }
}

export { FluenceBlockchainMs as Plugin };
