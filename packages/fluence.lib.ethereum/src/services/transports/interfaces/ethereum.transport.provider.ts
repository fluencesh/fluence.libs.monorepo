
import {
    EthereumTopic,
    EthereumTopicFilter,
    EthereumTransaction,
    EthereumTransactionReceipt,
    EthereumBlock,
} from '../../../types';
import { BlockchainTransportProvider, Scheme } from '@fluencesh/fluence.lib.services';
import BigNumber from 'bignumber.js';

export interface EthereumTransportProvider extends BlockchainTransportProvider<EthereumTransaction, EthereumBlock> {
    call(transaction: EthereumTransaction): Promise<string>;
    estimateGas(transaction: EthereumTransaction): Promise<number>;
    getGasPrice(): Promise<BigNumber>;
    getCode(address: string): Promise<string>;
    getLogs(filters: EthereumTopicFilter): Promise<Array<EthereumTopic>>;
    getTransactionReceipt(txHex: string): Promise<EthereumTransactionReceipt>;
    getAddressTransactionsCount(address: string, blockTag?: string | number): Promise<number>;
    callContractMethod(
        contractEntity: Scheme.ContractScheme,
        methodName: string,
        inputTypes: Array<string>,
        inputValues: Array<string>
    ): Promise<any>;
    contractMethodGasEstimate(
        contractEntity: Scheme.ContractScheme,
        methodName: string,
        inputTypes: Array<string>,
        inputValues: Array<string>
    ): Promise<any>;
}
