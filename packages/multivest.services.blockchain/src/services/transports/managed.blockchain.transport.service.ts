import { Block, MultivestError, PluginManager, Service, Transaction } from '@applicature/multivest.core';
import { Hashtable } from '@applicature/multivest.core';
import { BigNumber } from 'bignumber.js';
import * as logger from 'winston';
import { Scheme } from '../../types';
import { TransportConnectionService } from '../object/transport.connection.service';
import { BlockchainTransport } from './blockchain.transport';

export abstract class ManagedBlockchainTransportService extends Service implements BlockchainTransport {
    protected transportServices: Array<BlockchainTransport>;
    protected reference: BlockchainTransport;
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
        super(pluginManager);

        this.networkId = networkId;
        this.validityCheckDuration = validityCheckDuration;
        this.lastCheckAt = 0;
        this.allowedNumberOfBlockToDelay = allowedNumberOfBlockToDelay;
        this.activeTransports = {};

        this.transportConnectionService = new TransportConnectionService(pluginManager);
    }

    public abstract getBlockchainId(): string;
    public abstract getTransportId(): string;

    public async init() {
        this.transportConnectionService =
            this.pluginManager.getService('transport.connection.service') as TransportConnectionService;

        const connections = await this.transportConnectionService.listByBlockchainAndNetwork(
            this.getBlockchainId(),
            this.getNetworkId()
        );

        this.transportServices = this.prepareTransportServices(connections);
        this.reference = this.transportServices[0];
    }

    public getTransportConnection(): Scheme.TransportConnection {
        return null;
    }

    public getNetworkId(): string {
        return this.networkId;
    }

    public async getBlockByHash(hash: string) {
        const activeTransport = await this.getActiveTransportService();

        return activeTransport.getBlockByHash(hash);
    }

    public async getBlockHeight(): Promise<number> {
        const activeTransport = await this.getActiveTransportService();

        return activeTransport.getBlockHeight();
    }

    public async getBlockByHeight(blockHeight: number): Promise<Block> {
        const activeTransport = await this.getActiveTransportService();

        return activeTransport.getBlockByHeight(blockHeight);
    }

    public async getTransactionByHash(txHash: string): Promise<Transaction> {
        const activeTransport = await this.getActiveTransportService();

        return activeTransport.getTransactionByHash(txHash);
    }

    public async sendRawTransaction(txHex: string): Promise<Transaction> {
        const activeTransport = await this.getActiveTransportService();

        return activeTransport.sendRawTransaction(txHex);
    }

    public async getBalance(address: string, minConf: number): Promise<BigNumber> {
        const activeTransport = await this.getActiveTransportService();

        return activeTransport.getBalance(address, minConf);
    }

    protected abstract prepareTransportServices(connections: Array<Scheme.TransportConnection>)
        : Array<BlockchainTransport>;

    protected async updateValid() {
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
                    this.activeTransports[transportService.getTransportId()] = false;

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
                    this.activeTransports[transportService.getTransportId()] = true;

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

    protected async getActiveTransportService(): Promise<BlockchainTransport> {
        await this.updateValid();

        return this.transportServices.find((transportService) => {
            return this.activeTransports[transportService.getTransportId()];
        }) || null;
    }
}
