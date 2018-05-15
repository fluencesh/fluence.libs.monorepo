import { BlockchainTransportService, Scheme } from '@applicature-restricted/multivest.services.blockchain';
import { BigNumber } from 'bignumber.js';
import {
    ETHEREUM,
    EthereumTopic,
    EthereumTopicFilter,
    EthereumTransaction,
    EthereumTransactionReceipt,
} from '../../types';

export abstract class EthereumTransportService extends BlockchainTransportService {
    public getBlockchainId() {
        return ETHEREUM;
    }

    public abstract async call(transaction: EthereumTransaction): Promise<string>;
    public abstract async estimateGas(transaction: EthereumTransaction): Promise<number>;
    public abstract async getGasPrice(): Promise<BigNumber>;
    public abstract async getCode(address: string): Promise<string>;
    public abstract async getLogs(filters: EthereumTopicFilter): Promise<Array<EthereumTopic>>;
    public abstract async getTransactionReceipt(txHex: string): Promise<EthereumTransactionReceipt>;
    public abstract async getAddressTransactionsCount(address: string, blockTag?: string | number): Promise<number>;
    public abstract async callContractMethod(
        contractEntity: Scheme.ContractScheme,
        methodName: string,
        inputTypes?: Array<string>,
        inputValues?: Array<string>
    ): Promise<any>;
}
