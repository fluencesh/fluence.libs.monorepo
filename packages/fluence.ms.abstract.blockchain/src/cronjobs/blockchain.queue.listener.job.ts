import { QueueListenerJob } from './queue.listener.job';
import { Message } from '@applicature/synth.queues';
import {
    Scheme,
    BlockchainTransportProvider,
    ManagedBlockchainTransport,
    BlockchainRegistryService
} from '@fluencesh/fluence.lib.services';
import { BlockchainListenerHandler, BlockchainListener } from '../services';
import { PluginManager } from '@applicature/synth.plugin-manager';

export abstract class BlockchainQueueListenerJob<
    Transaction extends Scheme.BlockchainTransaction,
    Block extends Scheme.BlockchainBlock<Transaction>,
    Provider extends BlockchainTransportProvider<Transaction, Block>,
    ManagedBlockchainTransportService extends ManagedBlockchainTransport<Transaction, Block, Provider>
> extends QueueListenerJob {
    private handlers: Array<BlockchainListenerHandler<
        Transaction,
        Block,
        Provider,
        ManagedBlockchainTransportService
    >>;
    private blockchainId: string;

    private blockchainListener: BlockchainListener<Transaction, Block, Provider, ManagedBlockchainTransportService>;

    constructor(
        pluginManager: PluginManager,
        blockchainId: string,
        handlers: Array<BlockchainListenerHandler<
            Transaction,
            Block,
            Provider,
            ManagedBlockchainTransportService
        >>
    ) {
        super(pluginManager);

        this.blockchainId = blockchainId;
        this.handlers = handlers;
    }

    public async init() {
        const blockchainRegistry = this.pluginManager.getServiceByClass(BlockchainRegistryService);
        this.blockchainListener = new BlockchainListener(
            this.pluginManager,
            blockchainRegistry,
            this.blockchainId,
            this.handlers
        );
    }

    protected async processMessage(message: Message) {
        const data = message.data as Scheme.TransportConnectionJobData;
        await this.blockchainListener.execute(data);
    }
}
