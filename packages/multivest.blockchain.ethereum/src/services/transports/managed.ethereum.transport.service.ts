import {
//   BlockchainTransportService,
  ManagedBlockchainTransportService,
  Scheme,
  TransportConnectionService,
} from '@applicature-restricted/multivest.services.blockchain';
import { Block, Hashtable, MultivestError, PluginManager } from '@applicature/multivest.core';
import { BigNumber } from 'bignumber.js';
import {
    ETHEREUM,
    EthereumTopic,
    EthereumTopicFilter,
    EthereumTransaction,
    EthereumTransactionReceipt,
} from '../../types';
import { EthereumTransport } from '../transports/ethereum.transport';
import { EthersEthereumTransportService } from '../transports/ethers.ethereum.transport';

export class ManagedEthereumTransportService extends ManagedBlockchainTransportService
        implements EthereumTransport {
    protected transportServices: Array<EthereumTransport>;
    protected reference: EthereumTransport;

    public getBlockchainId() {
        return ETHEREUM;
    }

    public getNetworkId() {
        return this.networkId;
    }

    public getServiceId() {
        return 'managed.ethereum.transport.service';
    }

    public getTransportId() {
        return 'managed.ethereum.transport.service';
    }

    public async call(transaction: EthereumTransaction): Promise<string> {
        const transportService = await this.getActiveTransportService();

        return transportService.call(transaction);
    }

    public async estimateGas(transaction: EthereumTransaction): Promise<number> {
        const transportService = await this.getActiveTransportService();

        return transportService.estimateGas(transaction);
    }

    public async getGasPrice(): Promise<BigNumber> {
        const transportService = await this.getActiveTransportService();

        return transportService.getGasPrice();
    }

    public async getCode(address: string): Promise<string> {
        const transportService = await this.getActiveTransportService();

        return transportService.getCode(address);
    }

    public async getLogs(filters: EthereumTopicFilter): Promise<Array<EthereumTopic>> {
        const transportService = await this.getActiveTransportService();

        return transportService.getLogs(filters);
    }

    public async getTransactionReceipt(txHex: string): Promise<EthereumTransactionReceipt> {
        const transportService = await this.getActiveTransportService();

        return transportService.getTransactionReceipt(txHex);
    }

    public async getAddressTransactionsCount(address: string, blockTag?: number | string): Promise<number> {
        const transportService = await this.getActiveTransportService();

        return transportService.getAddressTransactionsCount(address, blockTag);
    }

    public async callContractMethod(
        contractEntity: Scheme.ContractScheme,
        methodName: string,
        inputTypes: Array<string> = [],
        inputValues: Array<string> = []
    ): Promise<any> {
        const transport = await this.getActiveTransportService();

        return transport.callContractMethod(contractEntity, methodName, inputTypes, inputValues);
    }

    public async contractMethodGasEstimate(
        contractEntity: Scheme.ContractScheme,
        methodName: string,
        inputTypes: Array<string> = [],
        inputValues: Array<string> = []
    ): Promise<any> {
        const transport = await this.getActiveTransportService();

        return transport.contractMethodGasEstimate(contractEntity, methodName, inputTypes, inputValues);
    }

    protected prepareTransportServices(connections: Array<Scheme.TransportConnection>) {
        return connections.map((con) => new EthersEthereumTransportService(this.pluginManager, con));
    }

    protected async getActiveTransportService(): Promise<EthereumTransport> {
        const activeTransportService = await super.getActiveTransportService();

        return activeTransportService as EthereumTransport;
    }
}
