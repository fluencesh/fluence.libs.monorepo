import {
  ManagedBlockchainTransportService,
  Scheme,
} from '@fluencesh/fluence.lib.services';
import { BigNumber } from 'bignumber.js';
import { ServiceIds, TransportIds } from '../../constants';
import {
    ETHEREUM,
    EthereumTopic,
    EthereumTopicFilter,
    EthereumTransaction,
    EthereumTransactionReceipt,
    EthereumBlock,
} from '../../types';
import { EthereumTransportProvider } from './interfaces';
import { EthersEthereumTransportService } from './ethers.ethereum.transport';

export class ManagedEthereumTransportService<Provider extends EthereumTransportProvider = EthereumTransportProvider>
    extends ManagedBlockchainTransportService<EthereumTransaction, EthereumBlock, Provider>
    implements ManagedEthereumTransportService<Provider> {

    public getBlockchainId(): string {
        return ETHEREUM;
    }

    public getNetworkId(): string {
        return this.networkId;
    }

    public getServiceId(): string {
        return ServiceIds.ManagedEthereumTransportService;
    }

    public getTransportId(): string {
        return TransportIds.ManagedEthereumTransportService;
    }

    public async call(transaction: EthereumTransaction, transportConnectionId?: string): Promise<string> {
        const transportService = await this.getActiveTransportService(transportConnectionId);

        return transportService.call(transaction);
    }

    public async estimateFee(transaction: EthereumTransaction, transportConnectionId?: string): Promise<BigNumber> {
        const transportService = await this.getActiveTransportService(transportConnectionId);

        return transportService.estimateFee(transaction);
    }

    public async getFeePrice(transportConnectionId?: string): Promise<BigNumber> {
        const transportService = await this.getActiveTransportService(transportConnectionId);

        return transportService.getFeePrice();
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
        transportConnectionId?: string,
        blockTag?: number | string
    ): Promise<number> {
        const transportService = await this.getActiveTransportService(transportConnectionId);

        return transportService.getAddressTransactionsCount(address, blockTag);
    }

    public async callContractMethod(
        contractEntity: Scheme.ContractScheme,
        methodName: string,
        inputTypes: Array<string> = [],
        inputValues: Array<string | Array<string>> = [],
        transportConnectionId?: string
    ): Promise<any> {
        const transport = await this.getActiveTransportService(transportConnectionId);

        return transport.callContractMethod(contractEntity, methodName, inputTypes, inputValues);
    }

    public async contractMethodFeeEstimate(
        contractEntity: Scheme.ContractScheme,
        methodName: string,
        inputTypes: Array<string> = [],
        inputValues: Array<string | Array<string>> = [],
        transportConnectionId?: string
    ): Promise<any> {
        const transport = await this.getActiveTransportService(transportConnectionId);

        return transport.contractMethodFeeEstimate(contractEntity, methodName, inputTypes, inputValues);
    }

    protected prepareTransportServices(connections: Array<Scheme.TransportConnection>): Array<Provider> {
        return connections.map<Provider>(
            (con) => new EthersEthereumTransportService(this.pluginManager, con) as any as Provider
        );
    }
}
