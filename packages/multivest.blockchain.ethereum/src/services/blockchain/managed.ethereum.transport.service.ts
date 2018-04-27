import {
//   BlockchainTransportService,
  ManagedBlockchainTransportService,
  TransportConnectionService
} from '@applicature-restricted/multivest.services.blockchain';
import { Block, Hashtable, MultivestError, PluginManager } from '@applicature/multivest.core';
import { BigNumber } from 'bignumber.js';
import { ETHEREUM, EthereumTransaction, EthereumTransactionReceipt } from '../../types';
import { EthereumTransportService } from '../transports/ethereum.transport';
import { EthersEthereumTransportService } from '../transports/ethers.ethereum.transport';

export class ManagedEthereumTransportService extends EthereumTransportService {
    protected transportServices: Array<EthereumTransportService>;
    protected reference: EthereumTransportService;
    protected validityCheckDuration: number;
    protected lastCheckAt: number;
    protected allowedNumberOfBlockToDelay: number;
    protected activeTransports: Hashtable<boolean>;
    protected transportConnectionService: TransportConnectionService;
    protected networkId: string;

    constructor(
        pluginManager: PluginManager,
        networkId: string,
        validityCheckDuration: number = 10000,
        allowedNumberOfBlockToDelay = 5
    ) {
        super(pluginManager, null);

        this.networkId = networkId;
        this.validityCheckDuration = validityCheckDuration;
        this.lastCheckAt = 0;
        this.allowedNumberOfBlockToDelay = allowedNumberOfBlockToDelay;
        this.activeTransports = {};
    }

    public async init() {
        this.transportConnectionService =
            this.pluginManager.getServiceByClass(TransportConnectionService) as TransportConnectionService;

        const connections = await this.transportConnectionService.listByBlockchainAndNetwork(
            this.getBlockchainId(),
            this.getNetworkId()
        );

        this.transportServices = connections.map((con) => new EthersEthereumTransportService(this.pluginManager, con));
        this.reference = this.transportServices[0];
    }

    public getBlockchainId() {
        return ETHEREUM;
    }

    public getNetworkId() {
        return this.networkId;
    }

    public getServiceId() {
        return 'managed.ethereum.transport.service';
    }

    public async getBlockByHash(hash: string): Promise<Block> {
        const transportService = await this.getActiveTransportService();

        return transportService.getBlockByHash(hash);
    }

    public async getBlockByHeight(height: number): Promise<Block> {
        const transportService = await this.getActiveTransportService();

        return transportService.getBlockByHeight(height);
    }

    public async getBlockHeight(): Promise<number> {
        const transportService = await this.getActiveTransportService();

        return transportService.getBlockHeight();
    }

    public async getTransactionByHash(hash: string): Promise<EthereumTransaction> {
        const transportService = await this.getActiveTransportService();

        return transportService.getTransactionByHash(hash);
    }

    public async sendRawTransaction(txHex: string): Promise<EthereumTransaction> {
        const transportService = await this.getActiveTransportService();

        return transportService.sendRawTransaction(txHex);
    }

    public async getBalance(address: string, minConf: number): Promise<BigNumber> {
        const transportService = await this.getActiveTransportService();

        return transportService.getBalance(address, minConf);
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

    public async getTransactionReceipt(txHex: string): Promise<EthereumTransactionReceipt> {
        const transportService = await this.getActiveTransportService();

        return transportService.getTransactionReceipt(txHex);
    }

    public async getAddressTransactionsCount(address: string, blockTag?: number | string): Promise<number> {
        const transportService = await this.getActiveTransportService();

        return transportService.getAddressTransactionsCount(address, blockTag);
    }

    public async updateValid() {
        const today = new Date();
        const now = +today;

        let referenceBlockHeight;
        try {
            referenceBlockHeight = await this.reference.getBlockHeight();
        } catch (ex) {
            throw new MultivestError(`Can not update transports' status. Original message: ${ex.message}`);
        }

        if (now > this.lastCheckAt + this.validityCheckDuration) {
            const inactiveIds: Array<string> = [];
            const activeIds: Array<string> = [];

            for (const transportService of this.transportServices) {
                const markTransportAsInactive = () => {
                    this.activeTransports[transportService.getServiceId()] = false;

                    if (
                        transportConnectionId
                        && !inactiveIds.includes(transportConnectionId)
                        && !activeIds.includes(transportConnectionId)
                    ) {
                        inactiveIds.push(transportConnectionId);
                    }
                };

                let blockHeight: number;
                try {
                    blockHeight = await transportService.getBlockHeight();
                } catch (ex) {
                    markTransportAsInactive();
                }
                
                const transportConnection = transportService.getTransportConnection();
                const transportConnectionId = transportConnection ? transportConnection.id : null;

                if (blockHeight >= referenceBlockHeight + this.allowedNumberOfBlockToDelay) {
                    markTransportAsInactive();
                } else {
                    this.activeTransports[transportService.getServiceId()] = true;

                    if (transportConnectionId) {
                        const indexOfBlockchainId = inactiveIds.indexOf(transportConnectionId);
                        if (indexOfBlockchainId !== -1) {
                            inactiveIds.splice(indexOfBlockchainId, 1);
                        }
    
                        activeIds.push(transportConnectionId);
                    }

                    break;
                }
            }

            await Promise.all([
                this.transportConnectionService.setFailedByIds(activeIds, true, today),
                this.transportConnectionService.setFailedByIds(inactiveIds, false, today)
            ]);

            this.lastCheckAt = now;
        }
    }

    private async getActiveTransportService(): Promise<EthereumTransportService> {
        await this.updateValid();

        return this.transportServices.find((transportService) => {
            return this.activeTransports[transportService.getServiceId()];
        }) || null;
    }
}
