import {
  ManagedBlockchainTransportService,
  Scheme,
} from '@applicature-private/fluence.lib.services';
import { BigNumber } from 'bignumber.js';
import { ServiceIds, TransportIds } from '../../constants';
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
        return ServiceIds.ManagedEthereumTransportService;
    }

    public getTransportId() {
        return TransportIds.ManagedEthereumTransportService;
    }

    public async call(transaction: EthereumTransaction, transportConnectionId?: string): Promise<string> {
        const transportService = await this.getActiveTransportService(transportConnectionId);

        return transportService.call(transaction);
    }

    public async estimateGas(transaction: EthereumTransaction, transportConnectionId?: string): Promise<number> {
        const transportService = await this.getActiveTransportService(transportConnectionId);

        return transportService.estimateGas(transaction);
    }

    public async getGasPrice(transportConnectionId?: string): Promise<BigNumber> {
        const transportService = await this.getActiveTransportService(transportConnectionId);

        return transportService.getGasPrice();
    }

    public async getCode(address: string, transportConnectionId?: string): Promise<string> {
        const transportService = await this.getActiveTransportService(transportConnectionId);

        return transportService.getCode(address);
    }

    public async getLogs(filters: EthereumTopicFilter, transportConnectionId?: string): Promise<Array<EthereumTopic>> {
        const transportService = await this.getActiveTransportService(transportConnectionId);

        return transportService.getLogs(filters);
    }

    public async getTransactionReceipt(
        txHex: string,
        transportConnectionId?: string
    ): Promise<EthereumTransactionReceipt> {
        const transportService = await this.getActiveTransportService(transportConnectionId);

        return transportService.getTransactionReceipt(txHex);
    }

    public async getAddressTransactionsCount(
        address: string,
        blockTag?: number | string,
        transportConnectionId?: string
    ): Promise<number> {
        const transportService = await this.getActiveTransportService(transportConnectionId);

        return transportService.getAddressTransactionsCount(address, blockTag);
    }

    public async callContractMethod(
        contractEntity: Scheme.ContractScheme,
        methodName: string,
        inputTypes: Array<string> = [],
        inputValues: Array<string> = [],
        transportConnectionId?: string
    ): Promise<any> {
        const transport = await this.getActiveTransportService(transportConnectionId);

        return transport.callContractMethod(contractEntity, methodName, inputTypes, inputValues);
    }

    public async contractMethodGasEstimate(
        contractEntity: Scheme.ContractScheme,
        methodName: string,
        inputTypes: Array<string> = [],
        inputValues: Array<string> = [],
        transportConnectionId?: string
    ): Promise<any> {
        const transport = await this.getActiveTransportService(transportConnectionId);

        return transport.contractMethodGasEstimate(contractEntity, methodName, inputTypes, inputValues);
    }

    protected prepareTransportServices(connections: Array<Scheme.TransportConnection>) {
        return connections.map((con) => new EthersEthereumTransportService(this.pluginManager, con));
    }

    protected async getActiveTransportService(transportConnectionId?: string): Promise<EthereumTransport> {
        const activeTransportService = await super.getActiveTransportService(transportConnectionId);

        return activeTransportService as EthereumTransport;
    }
}
