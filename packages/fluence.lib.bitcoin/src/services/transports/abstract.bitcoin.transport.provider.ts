import { PluginManager, Service } from '@applicature-private/core.plugin-manager';
import { Scheme } from '@applicature-private/fluence.lib.services';
import { BigNumber } from 'bignumber.js';
import { BITCOIN } from '../../constants';
import { BitcoinBlock, BitcoinTransaction } from '../../types';
import { BitcoinTransportProvider } from './interfaces';

export abstract class AbstractBitcoinTransportProvider extends Service implements BitcoinTransportProvider {
    protected networkId: string;
    protected transportConnection: Scheme.TransportConnection;

    constructor(pluginManager: PluginManager, transportConnection: Scheme.TransportConnection) {
        super(pluginManager);

        this.transportConnection = transportConnection;
        this.networkId = transportConnection.networkId;
    }

    public abstract getTransportId(): string;
    public abstract getBlockHeight(): Promise<number>;
    public abstract getBlockByHash(hash: string): Promise<BitcoinBlock>;
    public abstract getBlockByHeight(height: number): Promise<BitcoinBlock>;
    public abstract getTransactionByHash(hash: string): Promise<BitcoinTransaction>;
    public abstract sendRawTransaction(hex: string): Promise<BitcoinTransaction>;
    public abstract getBalance(address: string, minConf: number): Promise<BigNumber>;
    public abstract estimateFee(tx: BitcoinTransaction): Promise<BigNumber>;

    public getBlockchainId() {
        return BITCOIN;
    }

    public getNetworkId() {
        return this.networkId;
    }

    public getTransportConnection() {
        return this.transportConnection;
    }

    protected prepareHash(hash: string) {
        return hash.indexOf('0x') === 0 ? hash.slice(2) : hash;
    }
}
