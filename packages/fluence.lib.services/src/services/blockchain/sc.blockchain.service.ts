import {
    MultivestError,
    PluginManager,
    Service,
} from '@applicature-private/core.plugin-manager';
import { BigNumber } from 'bignumber.js';
import { Errors } from '../../errors';
import { Scheme } from '../../types';
import { ClientService } from '../object/client.service';
import { ProjectService } from '../object/project.service';
import { TransactionHashSubscriptionService } from '../object/transaction.hash.subscription.service';
import { BlockchainTransportProvider, ManagedBlockchainTransport } from '../transports';
import { BlockchainService } from './index';

export abstract class ScBlockchainService<
    Transaction extends Scheme.BlockchainTransaction,
    Block extends Scheme.BlockchainBlock<Transaction>,
    Provider extends BlockchainTransportProvider<Transaction, Block>,
    ManagedBlockchainTransportService extends ManagedBlockchainTransport<Transaction, Block, Provider>
> extends BlockchainService<Transaction, Block, Provider, ManagedBlockchainTransportService> {
    public abstract getGasPrice(transportId?: string): Promise<BigNumber>;

    public abstract getLogs(
        filters: Scheme.BlockchainEventFilter, transportId?: string
    ): Promise<Array<Scheme.BlockchainEvent>>;

    public abstract call(tx: Transaction, transportId?: string): Promise<string>;

    public abstract callContractMethod(
        contractEntity: Scheme.ContractScheme,
        methodName: string,
        inputTypes: Array<string>,
        inputValues: Array<string | Array<string>>,
        transportId?: string
    ): Promise<any>;

    public abstract contractMethodGasEstimate(
        contractEntity: Scheme.ContractScheme,
        methodName: string,
        inputTypes: Array<string>,
        inputValues: Array<string | Array<string>>,
        transportId?: string
    ): Promise<BigNumber>;

    public abstract estimateGas(tx: Transaction, transportId?: string): Promise<BigNumber>;
}
