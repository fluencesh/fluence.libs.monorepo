import { BlockchainTransportProvider, Scheme } from '@applicature-private/fluence.lib.services';
import { BigNumber } from 'bignumber.js';
import {
    ETHEREUM,
    EthereumTopic,
    EthereumTopicFilter,
    EthereumTransaction,
    EthereumTransactionReceipt,
} from '../../types';

export interface EthereumTransportProvider extends BlockchainTransportProvider<EthereumTransaction> {
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
        inputTypes?: Array<string>,
        inputValues?: Array<string>
    ): Promise<any>;
    contractMethodGasEstimate(
        contractEntity: Scheme.ContractScheme,
        methodName: string,
        inputTypes?: Array<string>,
        inputValues?: Array<string>
    ): Promise<any>;
}
