import { Job, PluginManager } from '@applicature/core.plugin-manager';
import {
    BlockchainService,
    Scheme,
    BlockchainTransportProvider,
    ManagedBlockchainTransportService
} from '@fluencesh/fluence.lib.services';
import { BlockchainHandler, BlockchainMonitor } from '../blockchain';

let blockchainId: string = null;
let networkId: string = null;

export class BlockchainListenerJob<
    Transaction extends Scheme.BlockchainTransaction,
    Block extends Scheme.BlockchainBlock<Transaction>,
    Provider extends BlockchainTransportProvider<Transaction, Block>,
    ManagedService extends ManagedBlockchainTransportService<Transaction, Block, Provider>,
    BlockchainServiceType extends BlockchainService<Transaction, Block, Provider, ManagedService>
> extends Job {
    protected monitor: BlockchainMonitor<Transaction, Block, Provider, ManagedService, BlockchainServiceType>;

    constructor(
        pluginManager: PluginManager,
        blockchainService: BlockchainServiceType,
        sinceBlock: number,
        handlers: Array<BlockchainHandler<Transaction, Block, Provider, ManagedService, BlockchainServiceType>>
    ) {
        blockchainId = blockchainService.getBlockchainId();
        networkId = blockchainService.getNetworkId();

        super(pluginManager);
        
        this.monitor = new BlockchainMonitor(
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
        await this.monitor.execute();
    }
}
