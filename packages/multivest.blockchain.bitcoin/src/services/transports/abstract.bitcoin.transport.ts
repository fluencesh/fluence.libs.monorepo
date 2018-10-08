import { Block, MultivestError, PluginManager, Service, Transaction } from '@fluencesh/multivest.core';
import { Scheme } from '@fluencesh/multivest.services.blockchain';
import { BigNumber } from 'bignumber.js';
import {
    address as BitcoinLibAddress,
    HDNode,
    networks as BitcoinLibNetworks,
    Transaction as BitcoinLibTx,
} from 'bitcoinjs-lib';
import * as config from 'config';
import { BITCOIN } from '../../constants';
import { Errors } from '../../errors';
import { AvailableNetwork } from '../../types';
import { BitcoinTransport } from './bitcoin.transport';

export abstract class AbstractBitcoinTransportService extends Service implements BitcoinTransport {
    protected networkId: string;
    protected transportConnection: Scheme.TransportConnection;

    constructor(pluginManager: PluginManager, transportConnection: Scheme.TransportConnection) {
        super(pluginManager);

        this.transportConnection = transportConnection;
        this.networkId = transportConnection.networkId;
    }

    public abstract getServiceId(): string;
    public abstract getTransportId(): string;
    public abstract getBlockHeight(): Promise<number>;
    public abstract getBlockByHash(hash: string): Promise<Block>;
    public abstract getBlockByHeight(height: number): Promise<Block>;
    public abstract getTransactionByHash(hash: string): Promise<Transaction>;
    public abstract sendRawTransaction(hex: string): Promise<Transaction>;
    public abstract getBalance(address: string, minConf: number): Promise<BigNumber>;

    public getBlockchainId() {
        return BITCOIN;
    }

    public getNetworkId() {
        return this.networkId;
    }

    public getTransportConnection() {
        return this.transportConnection;
    }

    public async getHDAddress(index: number): Promise<string> {
        const masterPubKey = config.has('multivest.blockchain.bitcoin.hd.masterPublicKey')
            ? config.get<string>('multivest.blockchain.bitcoin.hd.masterPublicKey')
            : null;

        if (!masterPubKey) {
            throw new MultivestError(Errors.MASTER_PUBLIC_KEY_REQUIRED);
        }

        const network = this.networkId === AvailableNetwork.MAIN_NET
            ? BitcoinLibNetworks.bitcoin
            : BitcoinLibNetworks.testnet;

        const hdNode = HDNode.fromBase58(masterPubKey, network);

        return hdNode.derive(0).derive(index).getAddress().toString();
    }

    public isValidAddress(address: string): boolean {
        const preparedHash = this.prepareHash(address);

        try {
            BitcoinLibAddress.fromBase58Check(preparedHash);

            return true;
        } catch (ex) {
            return false;
        }
    }

    protected prepareHash(hash: string) {
        return hash.indexOf('0x') === 0 ? hash.slice(2) : hash;
    }
}
