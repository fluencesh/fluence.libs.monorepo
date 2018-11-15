import { Scheme } from '../../../types';
import BigNumber from 'bignumber.js';
import { ManagedBlockchainTransport } from './managed.blockchain.transport';
import { ScBlockchainTransportProvider } from './sc.blockchain.transport.provider';

export interface ManagedScBlockchainTransport<
    Transaction extends Scheme.BlockchainTransaction,
    Block extends Scheme.BlockchainBlock<Transaction>,
    Provider extends ScBlockchainTransportProvider<Transaction, Block>,
> extends ManagedBlockchainTransport<Transaction, Block, Provider> {
    getFeePrice(transportConnectionId: string): Promise<BigNumber>;

    getLogs(
        filters: Scheme.BlockchainEventFilter,
        transportConnectionId: string
    ): Promise<Array<Scheme.BlockchainEvent>>;
    call(tx: Transaction, transportConnectionId: string): Promise<string>;

    callContractMethod(
        contractEntity: Scheme.ContractScheme,
        methodName: string,
        inputTypes: Array<string>,
        inputValues: Array<string | Array<string>>,
        transportConnectionId: string
    ): Promise<any>;

    contractMethodFeeEstimate(
        contractEntity: Scheme.ContractScheme,
        methodName: string,
        inputTypes: Array<string>,
        inputValues: Array<string | Array<string>>,
        transportConnectionId: string
    ): Promise<BigNumber>;
}
