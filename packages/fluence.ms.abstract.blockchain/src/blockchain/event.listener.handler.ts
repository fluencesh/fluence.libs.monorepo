import { Hashtable, PluginManager } from '@applicature/synth.plugin-manager';
import {
    BlockchainTransportProvider,
    ScBlockchainService,
    ManagedBlockchainTransport,
    Scheme,
    ScBlockchainTransportProvider,
    ManagedScBlockchainTransport
} from '@fluencesh/fluence.lib.services';
import { set } from 'lodash';
import { BlockchainListenerHandler } from './blockchain.listener.handler';

// TODO: move to separate package
// https://applicature.atlassian.net/browse/FLC-209
export abstract class EventListenerHandler<
    Transaction extends Scheme.BlockchainTransaction,
    Block extends Scheme.BlockchainBlock<Transaction>,
    Provider extends ScBlockchainTransportProvider<Transaction, Block>,
    ManagedBlockchainTransportService extends ManagedScBlockchainTransport<Transaction, Block, Provider>
> extends BlockchainListenerHandler<Transaction, Block, Provider, ManagedBlockchainTransportService> {

    protected async getLogsByBlockHeight(
        blockchainService: ScBlockchainService<Transaction, Block, Provider, ManagedBlockchainTransportService>,
        transportConnectionId: string,
        height: number
    ): Promise<Array<Scheme.BlockchainEvent>> {
        const logsFilters = {
            fromBlock: height,
            toBlock: height,
        } as Scheme.BlockchainEventFilter;

        return blockchainService.getLogs(logsFilters, transportConnectionId);
    }

    protected async getLogMapByBlockHeight(
        blockchainService: ScBlockchainService<Transaction, Block, Provider, ManagedBlockchainTransportService>,
        transportConnectionId: string,
        height: number
    ) {
        const logs = await this.getLogsByBlockHeight(blockchainService, transportConnectionId, height);
        const logsMap: Hashtable<Scheme.BlockchainEvent> = logs.reduce((map, log) => set(map, log.address, log), {});

        return logsMap;
    }

    protected abstract convertAbiMethodInTopic(abiMethod: any): string;

    protected abstract decodeData(types: Array<string>, data: string): Array<string>;
}
