import { Block, MultivestError, PluginManager, Transaction } from '@applicature/multivest.core';
import {
    ETHEREUM, EthereumBlock, EthereumTransaction, EthereumTransactionReceipt,
    ethereumValidNetworks
} from '../types/types';
import {EthereumTransportService} from "./ethereum.transport";

import { providers } from 'ethers';

export enum Provider {
    JsonRpc,
    Etherscan,
    Infura
}

export class EthersEthereumTransportService extends EthereumTransportService {
    private network: string;
    private provider: any;

    constructor(provider: Provider, network: string, url: string, apiToken?: string) {
        super(null);

        if (ethereumValidNetworks.indexOf(network) == -1) {
            throw new MultivestError('unknown network');
        }

        this.network = network;

        if (provider === Provider.Infura) {
            this.provider = new providers.InfuraProvider(network, apiToken)
        }
        else if (provider === Provider.Etherscan) {
            this.provider = new providers.EtherscanProvider(network, apiToken);
        }
        else if (provider === Provider.JsonRpc) {
            this.provider = new providers.JsonRpcProvider(url, network);
        }
        else {
            throw new MultivestError('unknown provider');
        }
    }

    public getBlockHeight(): Promise<number> {
        return this.provider.getBlockNumber();
    }

    public async getBlockByHeight(blockHeight: number): Promise<Block> {
        const block = await this.provider.getBlock(blockHeight);

        return this.convertBlock(block);
    }

    public async getTransactionByHash(txHash: string) {
        const tx = this.provider.getTransaction(txHash) as any;

        return this.convertTransaction(tx);
    }

    public async sendRawTransaction(txHex: string): Promise<string> {
        return this.provider.sendTransaction(txHex);
    }

    public async call(tx: EthereumTransaction): Promise<string> {
        return this.provider.call({
            to: tx.to,
            nonce: tx.nonce,
            gasLimit: tx.gas,
            gasPrice: tx.gasPrice,
            data: tx.input,
            value: tx.to[0].amount
        });
    }

    public async getBalance(address: string, minConf: number) {
        if (minConf && minConf > 0) {
            throw new MultivestError('minConf is not supported');
        }

        return this.provider.getBalance(address);
    }

    public async estimateGas(transaction: EthereumTransaction): Promise<number> {
        return this.provider.estimateGas(transaction)
    }

    public async getGasPrice(): Promise<number> {
        return this.provider.getGasPrice();
    }

    public async getCode(address: string): Promise<string> {
        return this.provider.getCode(address);
    }

    public async getTransactionReceipt(txHex: string): Promise<EthereumTransactionReceipt> {
        const receipt = await this.provider.getTransactionReceipt(txHex);

        return this.convertTransactionReceipt(receipt);
    }

    private convertBlock(block: any): EthereumBlock {
        return {
            height: block.number,
            hash: block.hash,
            parentHash: block.parentHash,
            difficulty: block.difficulty.toNumber(),
            time: block.timestamp,
            nonce: block.nonce,

            network: ETHEREUM,
            size: block.size,
            transactions: block.transactions.map(this.convertTransaction),
            fee: null, // @TODO: define

            sha3Uncles: block.sha3Uncles,
            logsBloom: block.logsBloom,
            transactionsRoot: block.transactionsRoot,
            stateRoot: block.stateRoot,
            receiptsRoot: block.receiptsRoot,
            miner: block.miner,
            totalDifficulty: block.totalDifficulty,
            extraData: block.extraData,
            gasLimit: block.gasLimit,
            gasUsed: block.gasUsed,
            uncles: block.uncles
        };
    }

    private convertTransaction(tx: any): EthereumTransaction {
        return {
            hash: tx.hash,
            blockHash: tx.blockHash,
            blockHeight: tx.blockNumber,

            fee: tx.gasPrice.times(tx.gas),
            from: [{ address: tx.from }],
            to: [{ address: tx.to, amount: tx.value }],

            gas: tx.gas,
            gasPrice: tx.gasPrice,
            nonce: tx.nonce,
            input: tx.input,
            transactionIndex: tx.transactionIndex
        };
    }

    private convertTransactionReceipt(receipt: any): EthereumTransactionReceipt {
        // @TODO: implement

        throw new MultivestError('not implemented');
    }
}
