
import {
    EthereumTopic,
    EthereumTopicFilter,
    EthereumTransaction,
    EthereumTransactionReceipt,
    EthereumBlock,
} from '../../../types';
import { Scheme, ManagedBlockchainTransport } from '@applicature-private/fluence.lib.services';
import BigNumber from 'bignumber.js';
import { EthereumTransportProvider } from './ethereum.transport.provider';

export interface ManagedEthereumTransport<
    Provider extends EthereumTransportProvider = EthereumTransportProvider
> extends ManagedBlockchainTransport<
    EthereumTransaction,
    EthereumBlock,
    Provider
> {
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
        inputValues: Array<string | Array<string>>,
        transportConnectionId: string
    ): Promise<any>;
    contractMethodGasEstimate(
        contractEntity: Scheme.ContractScheme,
        methodName: string,
        inputTypes: Array<string>,
        inputValues: Array<string | Array<string>>,
        transportConnectionId: string
    ): Promise<any>;
}
