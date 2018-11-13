import {
    Hashtable,
    MultivestError,
    PluginManager,
    Service,
} from '@applicature/core.plugin-manager';
import { BigNumber } from 'bignumber.js';
import * as logger from 'winston';
import { Errors } from '../../errors';
import { Scheme } from '../../types';
import { TransportConnectionService } from '../object/transport.connection.service';
import { BlockchainTransportProvider, ManagedBlockchainTransport } from './interfaces';

export abstract class ManagedBlockchainTransportService<
    Transaction extends Scheme.BlockchainTransaction,
    Block extends Scheme.BlockchainBlock<Transaction>,
    Provider extends BlockchainTransportProvider<Transaction, Block>
> extends Service implements ManagedBlockchainTransport<Transaction, Block, Provider> {

    protected transportServices: Array<Provider>;
    protected publicTransportServices: Array<Provider>;
    protected reference: Provider;
    protected validityCheckDuration: number;
    protected lastCheckAt: number;
    protected allowedNumberOfBlockToDelay: number;
    protected activeTransports: Hashtable<boolean>;
    protected transportConnectionService: TransportConnectionService;
    protected networkId: string;
    protected lastTransportConnectionsSearchAt: Date;
    protected transportsCallsStatistic: Hashtable<number>;

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
        this.transportsCallsStatistic = {};
    }

    public abstract getBlockchainId(): string;
    public abstract getTransportId(): string;

    public async init() {
        this.transportConnectionService =
            this.pluginManager.getService('transport.connection.service') as TransportConnectionService;

        this.lastTransportConnectionsSearchAt = new Date();
        // TODO: test it
        const connections = await this.transportConnectionService.listByBlockchainAndNetworkAndStatus(
            this.getBlockchainId(),
            this.getNetworkId(),
            Scheme.TransportConnectionStatus.Enabled
        );

        this.transportServices = this.prepareTransportServices(connections);
        this.publicTransportServices = this.transportServices.filter((ts) => !ts.getTransportConnection().isPrivate);
        this.reference = this.publicTransportServices[0];
    }

    public getTransportConnection(): Scheme.TransportConnection {
        return null;
    }

    public getNetworkId(): string {
        return this.networkId;
    }

    public getStatistic(): Scheme.ManagedBlockchainTransportStatistic {
        const connectionsCount = this.transportServices.length;
        const healthyConnectionsCount = Object
            .keys(this.activeTransports)
            .filter((key) => this.activeTransports[key]).length;
        const unhealthyConnectionsCount = connectionsCount - healthyConnectionsCount;

        const statistic: Scheme.ManagedBlockchainTransportStatistic = {
            connectionsCount,
            healthyConnectionsCount,
            unhealthyConnectionsCount,
            transportsCallsStatistic: this.transportsCallsStatistic
        };

        for (const transportId of Object.keys(this.transportsCallsStatistic)) {
            this.transportsCallsStatistic[transportId] = 0;
        }

        return statistic;
    }

    public async getBlockByHash(hash: string, transportId: string) {
        const activeTransport = await this.getActiveTransportService(transportId);

        return activeTransport.getBlockByHash(hash);
    }

    public async getBlockHeight(transportId: string): Promise<number> {
        const activeTransport = await this.getActiveTransportService(transportId);

        return activeTransport.getBlockHeight();
    }

    public async getBlockByHeight(blockHeight: number, transportId: string) {
        const activeTransport = await this.getActiveTransportService(transportId);

        return activeTransport.getBlockByHeight(blockHeight);
    }

    public async getTransactionByHash(
        txHash: string, transportId: string) {
        const activeTransport = await this.getActiveTransportService(transportId);

        return activeTransport.getTransactionByHash(txHash);
    }

    public async sendRawTransaction(txHex: string, transportId: string) {
        const activeTransport = await this.getActiveTransportService(transportId);

        return activeTransport.sendRawTransaction(txHex);
    }

    public async getBalance(address: string, minConf: number, transportId: string): Promise<BigNumber> {
        const activeTransport = await this.getActiveTransportService(transportId);

        return activeTransport.getBalance(address, minConf);
    }

    protected abstract prepareTransportServices(connections: Array<Scheme.TransportConnection>): Array<Provider>;

    protected async updateValid() {
        const today = new Date();
        const now = +today;

        try {
            await this.loadNewTransportConnections();
        } catch (ex) {
            logger.error(`Cant load new connections. Reason: ${ ex.message }`);
        }

        let referenceBlockHeight;
        try {
            referenceBlockHeight = await this.reference.getBlockHeight();

            if (referenceBlockHeight === null) {
                throw new MultivestError('Invalid response');
            }
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

    protected async getActiveTransportService(transportId: string): Promise<Provider> {
        await this.updateValid();

        this.transportsCallsStatistic[transportId]++;

        let transport: Provider = null;
        if (transportId) {
            transport = this.transportServices.find((transportService) => {
                return this.activeTransports[transportService.getTransportId()]
                    && transportService.getTransportConnection().id === transportId;
            });
        } else {
            transport = this.publicTransportServices.find((transportService) => {
                return this.activeTransports[transportService.getTransportId()];
            });
        }

        if (!transport) {
            throw new MultivestError(Errors.SPECIFIED_TRANSPORT_NOT_FOUND);
        }

        return transport;
    }

    protected async loadNewTransportConnections(): Promise<void> {
        const today = new Date();

        const newTransportConnections = await this.transportConnectionService
            .listByBlockchainAndNetworkAndStatusAndCreatedAt(
                this.getBlockchainId(),
                this.getNetworkId(),
                Scheme.TransportConnectionStatus.Enabled,
                today,
                Scheme.ComparisonOperators.Gt
            );

        this.transportServices.push(...this.prepareTransportServices(newTransportConnections));
        this.publicTransportServices.push(
            ...this.transportServices.filter((ts) => !ts.getTransportConnection().isPrivate)
        );

        this.lastTransportConnectionsSearchAt = today;
    }
}
