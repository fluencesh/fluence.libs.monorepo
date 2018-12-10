import { QueueListenerJob } from './queue.listener.job';
import { Message } from '@applicature/synth.queues';
import {
    Scheme,
    BlockchainTransportProvider,
    ManagedBlockchainTransport
} from '@fluencesh/fluence.lib.services';
import { BlockchainListenerHandler, BlockchainListener } from '../blockchain';
import { PluginManager } from '@applicature/synth.plugin-manager';

export abstract class BlockchainQueueListenerJob<
    Transaction extends Scheme.BlockchainTransaction,
    Block extends Scheme.BlockchainBlock<Transaction>,
    Provider extends BlockchainTransportProvider<Transaction, Block>,
    ManagedBlockchainTransportService extends ManagedBlockchainTransport<Transaction, Block, Provider>
> extends QueueListenerJob {
    private blockchainId: string;

    private blockchainListener: BlockchainListener<Transaction, Block, Provider, ManagedBlockchainTransportService>;

    constructor(
        pluginManager: PluginManager,
        blockchainId: string
    ) {
        super(pluginManager);

        this.blockchainId = blockchainId;
    }

    public async init() {
        await super.init();

        const handlers = this.prepareHandlers();

        this.blockchainListener = new BlockchainListener(
            this.pluginManager,
            this.blockchainId,
            handlers
        );
    }

    protected async processMessage(message: Message) {
        const data = message.data as Scheme.TransportConnectionJobData;
        await this.blockchainListener.execute(data);
    }

    protected abstract prepareHandlers(): Array<BlockchainListenerHandler<
        Transaction,
        Block,
        Provider,
        ManagedBlockchainTransportService
    >>;
}
