import { Job, PluginManager } from '@applicature-private/core.plugin-manager';
import { BlockchainService } from '@applicature-private/fluence.lib.services';
import { BlockchainHandler, BlockchainMonitor } from '../blockchain';

let blockchainId: string = null;
let networkId: string = null;

export class BlockchainListenerJob extends Job {
    protected blockchainSqsPublisher: BlockchainMonitor;

    constructor(
        pluginManager: PluginManager,
        blockchainService: BlockchainService,
        sinceBlock: number,
        handlers: Array<BlockchainHandler>
    ) {
        blockchainId = blockchainService.getBlockchainId();
        networkId = blockchainService.getNetworkId();

        super(pluginManager);
        
        this.blockchainSqsPublisher = new BlockchainMonitor(
            pluginManager,
            blockchainService,
            sinceBlock,
            handlers
        );
    }

    public getJobId() {
        return `blockchain.listener.${ blockchainId }.${ networkId }`;
    }

    public async execute() {
        await this.blockchainSqsPublisher.execute();
    }
}
