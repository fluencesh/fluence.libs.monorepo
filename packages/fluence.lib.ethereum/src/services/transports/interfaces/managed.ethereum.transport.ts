
import {
    EthereumTopic,
    EthereumTopicFilter,
    EthereumTransaction,
    EthereumTransactionReceipt,
    EthereumBlock,
} from '../../../types';
import { Scheme, ManagedBlockchainTransport } from '@fluencesh/fluence.lib.services';
import BigNumber from 'bignumber.js';

export interface ManagedEthereumTransport extends ManagedBlockchainTransport<EthereumTransaction, EthereumBlock> {
    call(transaction: EthereumTransaction, transportConnectionId: string): Promise<string>;
    estimateGas(transaction: EthereumTransaction, transportConnectionId: string): Promise<number>;
    getGasPrice(transportConnectionId: string): Promise<BigNumber>;
    getCode(address: string, transportConnectionId: string): Promise<string>;
    getLogs(filters: EthereumTopicFilter, transportConnectionId: string): Promise<Array<EthereumTopic>>;
    getTransactionReceipt(txHex: string, transportConnectionId: string): Promise<EthereumTransactionReceipt>;
    getAddressTransactionsCount(
        address: string,
        transportConnectionId: string,
        blockTag?: string | number
    ): Promise<number>;
    callContractMethod(
        contractEntity: Scheme.ContractScheme,
        methodName: string,
        inputTypes: Array<string>,
        inputValues: Array<string>,
        transportConnectionId: string
    ): Promise<any>;
    contractMethodGasEstimate(
        contractEntity: Scheme.ContractScheme,
        methodName: string,
        inputTypes: Array<string>,
        inputValues: Array<string>,
        transportConnectionId: string
    ): Promise<any>;
}
