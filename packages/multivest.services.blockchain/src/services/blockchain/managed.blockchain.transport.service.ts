import { Block, PluginManager, Transaction } from '@applicature/multivest.core';
import { Hashtable } from '@applicature/multivest.core';
import { BigNumber } from 'bignumber.js';
import { BlockchainTransportService } from './blockchain.transport.service';

import * as logger from 'winston';
import { TransportConnectionService } from '../object/transport.connection.service';

export class ManagedBlockchainTransportService extends BlockchainTransportService {
    protected transportServices: Array<BlockchainTransportService>;
    protected reference: BlockchainTransportService;
    protected validityCheckDuration: number;
    protected lastCheckAt: number;
    protected allowedNumberOfBlockToDelay: number;
    protected activeTransports: Hashtable<boolean>;
    protected transportConnectionService: TransportConnectionService;

    constructor(
        pluginManager: PluginManager
    ) {
        super(pluginManager, null);

        this.transportConnectionService = new TransportConnectionService(pluginManager);
    }

    public getServiceId() {
        return 'managed.blockchain.transport.service';
    }

    public getNetworkId(): string {
        for (const transportService of this.transportServices) {
            return transportService.getNetworkId();
        }
    }

    public getBlockByHash(hash: string) {
        for (const transportService of this.transportServices) {
            return transportService.getBlockByHash(hash);
        }
    }

    public async updateValid() {
        const today = new Date();
        const now = +today;

        const referenceBlockHeight = await this.reference.getBlockHeight();

        if (now > this.lastCheckAt + this.validityCheckDuration) {
            const inactiveIds: Array<string> = [];
            const activeIds: Array<string> = [];

            for (const transportService of this.transportServices) {
                const blockHeight = await transportService.getBlockHeight();

                const transportConnection = transportService.getTransportConnection();
                const transportConnectionId = transportConnection ? transportConnection.id : null;

                if (blockHeight >= referenceBlockHeight + this.allowedNumberOfBlockToDelay) {
                    this.activeTransports[transportService.getServiceId()] = false;

                    if (
                        transportConnectionId
                        && !inactiveIds.includes(transportConnectionId)
                        && !activeIds.includes(transportConnectionId)
                    ) {
                        inactiveIds.push(transportConnectionId);
                    }
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

    public getBlockchainId(): string {
        for (const transportService of this.transportServices) {
            return transportService.getBlockchainId();
        }
    }

    public async getBlockHeight(): Promise<number> {
        await this.updateValid();

        for (const transportService of this.transportServices) {
            if (this.activeTransports[transportService.getServiceId()] === false) {
                continue;
            }

            try {
                return transportService.getBlockHeight();
            }
            catch (error) {
                logger.error('Failed to getBlockHeight', {serviceId: transportService.getServiceId(), error});
                this.activeTransports[transportService.getServiceId()] = false;
            }
        }

        return this.reference.getBlockHeight();
    }

    public async getBlockByHeight(blockHeight: number): Promise<Block> {
        await this.updateValid();

        for (const transportService of this.transportServices) {
            if (this.activeTransports[transportService.getServiceId()] === false) {
                continue;
            }

            try {
                return transportService.getBlockByHeight(blockHeight);
            }
            catch (error) {
                logger.error('Failed to getBlockByHeight', {serviceId: transportService.getServiceId(), error});
                this.activeTransports[transportService.getServiceId()] = false;
            }
        }

        return this.reference.getBlockByHeight(blockHeight);
    }

    public async getTransactionByHash(txHash: string): Promise<Transaction> {
        await this.updateValid();

        for (const transportService of this.transportServices) {
            if (this.activeTransports[transportService.getServiceId()] === false) {
                continue;
            }

            try {
                return transportService.getTransactionByHash(txHash);
            }
            catch (error) {
                logger.error('Failed to getTransactionByHash', {serviceId: transportService.getServiceId(), error});
                this.activeTransports[transportService.getServiceId()] = false;
            }
        }

        return this.reference.getTransactionByHash(txHash);
    }

    // @TODO: do we need that?
    // public async sendTransaction(txData: Transaction): Promise<string> {
    //     await this.updateValid();
    //
    //     for (const transportService of this.transportServices) {
    //         if (this.activeTransports[transportService.getServiceId()] === false) {
    //             continue;
    //         }
    //
    //         try {
    //             return transportService.sendTransaction(txData);
    //         }
    //         catch (error) {
    //             logger.error('Failed to sendTransaction', {serviceId: transportService.getServiceId(), error});
    //             this.activeTransports[transportService.getServiceId()] = false;
    //         }
    //     }
    //
    //     return this.reference.sendTransaction(txData);
    // }

    public async sendRawTransaction(txHex: string): Promise<string> {
        await this.updateValid();

        for (const transportService of this.transportServices) {
            if (this.activeTransports[transportService.getServiceId()] === false) {
                continue;
            }

            try {
                return transportService.sendRawTransaction(txHex);
            }
            catch (error) {
                logger.error('Failed to sendRawTransaction', {serviceId: transportService.getServiceId(), error});
                this.activeTransports[transportService.getServiceId()] = false;
            }
        }

        return this.reference.sendRawTransaction(txHex);
    }

    public async getBalance(address: string, minConf: number): Promise<BigNumber> {
        await this.updateValid();

        for (const transportService of this.transportServices) {
            if (this.activeTransports[transportService.getServiceId()] === false) {
                continue;
            }

            try {
                return transportService.getBalance(address, minConf);
            }
            catch (error) {
                logger.error('Failed to getBalance', {serviceId: transportService.getServiceId(), error});
                this.activeTransports[transportService.getServiceId()] = false;
            }
        }

        return this.reference.getBalance(address, minConf);
    }
}
