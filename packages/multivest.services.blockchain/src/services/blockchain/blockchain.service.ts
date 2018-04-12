import { Block, Transaction } from '@applicature/multivest.core';
import {MultivestError, PluginManager, Service} from '@applicature/multivest.core';
import { BigNumber } from 'bignumber.js';
import { BlockchainTransportService } from './blockchain.transport.service';

export interface Signature {
    v: number;
    r: Buffer;
    s: Buffer;
}

export abstract class BlockchainService extends Service {
    protected network: string;
    protected blockChainTransportService: BlockchainTransportService;

    constructor(
        pluginManager: PluginManager,
        network: string,
        blockChainTransportService: BlockchainTransportService
    ) {
        super(pluginManager);

        if (!this.isValidNetwork(network)) {
            throw new MultivestError('wrong network');
        }

        this.network = network;
        this.blockChainTransportService = blockChainTransportService;
    }

    public abstract isValidNetwork(network: string): boolean;
    public abstract getSymbol(): string;
    public abstract getHDAddress(index: number): string;
    public abstract isValidAddress(address: string): boolean;
    public abstract signData(privateKey: Buffer, data: Buffer): Signature;
    public abstract signDataAndStringify(privateKey: Buffer, data: Buffer): string;
    public abstract signTransaction(privateKey: Buffer, txData: Transaction): string;

    public getBlockchainId(): string {
        return this.blockChainTransportService.getBlockchainId();
    }

    public getNetworkId(): string {
        return this.blockChainTransportService.getNetworkId();
    }

    public async getBlockHeight(): Promise<number> {
        return this.blockChainTransportService.getBlockHeight();
    }

    public async getBlockByHeight(blockHeight: number): Promise<Block> {
        return this.blockChainTransportService.getBlockByHeight(blockHeight);
    }

    public async getBlockByHash(blockHash: string): Promise<Block> {
        return this.blockChainTransportService.getBlockByHash(blockHash);
    }

    public async getTransactionByHash(txHash: string): Promise<Transaction> {
        return this.blockChainTransportService.getTransactionByHash(txHash);
    }

    public async sendTransaction(privateKey: Buffer, txData: Transaction): Promise<string> {
        const txHex = await this.signTransaction(privateKey, txData);

        return this.blockChainTransportService.sendRawTransaction(txHex);
    }

    public async sendRawTransaction(txHex: string): Promise<string> {
        return this.blockChainTransportService.sendRawTransaction(txHex);
    }

    public async getBalance(address: string, minConf: number): Promise<BigNumber> {
        return this.blockChainTransportService.getBalance(address, minConf);
    }
}
