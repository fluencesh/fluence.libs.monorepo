import {Block, PluginManager, Service, Transaction} from '@applicature/multivest.core';
import { BigNumber } from 'bignumber.js';
import { Scheme } from '../../..';

export abstract class BlockchainTransportService extends Service {
    protected transportConnection: Scheme.TransportConnection;

    constructor(pluginManager: PluginManager, transportConnection: Scheme.TransportConnection) {
        super(pluginManager);

        this.transportConnection = transportConnection;
    }

    public getTransportConnection() {
        return this.transportConnection;
    }

    public abstract getBlockchainId(): string;
    public abstract getNetworkId(): string;
    public abstract async getBlockHeight(): Promise<number>;
    public abstract async getBlockByHash(blockHash: string): Promise<Block>;
    public abstract async getBlockByHeight(blockHeight: number): Promise<Block>;
    public abstract async getTransactionByHash(txHash: string): Promise<Transaction>;
    public abstract async sendRawTransaction(txHex: string): Promise<Transaction>;
    public abstract async getBalance(address: string, minConf: number): Promise<BigNumber>;
}
