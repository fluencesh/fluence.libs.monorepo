import { Scheme } from '../../../types';
import BigNumber from 'bignumber.js';
import { BlockchainTransportProvider } from './blockchain.transport.provider';

export interface ScBlockchainTransportProvider<
    Transaction extends Scheme.BlockchainTransaction,
    Block extends Scheme.BlockchainBlock<Transaction>
> extends BlockchainTransportProvider<Transaction, Block> {
    getFeePrice(): Promise<BigNumber>;

    getLogs(filters: Scheme.BlockchainEventFilter): Promise<Array<Scheme.BlockchainEvent>>;
    call(tx: Transaction): Promise<string>;

    callContractMethod(
        contractEntity: Scheme.ContractScheme,
        methodName: string,
        inputTypes: Array<string>,
        inputValues: Array<string | Array<string>>
    ): Promise<any>;

    contractMethodFeeEstimate(
        contractEntity: Scheme.ContractScheme,
        methodName: string,
        inputTypes: Array<string>,
        inputValues: Array<string | Array<string>>
    ): Promise<BigNumber>;
}
