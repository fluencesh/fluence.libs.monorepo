import { Scheme } from '@applicature-restricted/multivest.services.blockchain';
import { Block, MultivestError, PluginManager, Transaction } from '@applicature/multivest.core';
import { BigNumber } from 'bignumber.js';
import * as EthJsTransaction from 'ethereumjs-tx';
import { Contract, providers } from 'ethers';
import {
    ETHEREUM,
    EthereumBlock,
    EthereumTransaction,
    EthereumTransactionReceipt,
    ethereumValidNetworks
} from '../../types';
import { EthereumTransportService } from './ethereum.transport';

export enum Provider {
    JsonRpc = 'json-rpc',
    Etherscan = 'etherscan',
    Infura = 'infura'
}

export class EthersEthereumTransportService extends EthereumTransportService {
    private network: string;
    private provider: any;

    constructor(pluginManager: PluginManager, transportConnection: Scheme.TransportConnection) {
        super(pluginManager, transportConnection);

        this.network = this.transportConnection.networkId;

        if (ethereumValidNetworks.indexOf(this.network) === -1) {
            throw new MultivestError('unknown network');
        }

        const url = this.transportConnection.settings.url;
        const apiToken = this.transportConnection.settings.apiUrl;

        if (transportConnection.providerId === Provider.Infura) {
            this.provider = new providers.InfuraProvider(this.network, apiToken);
        } else if (transportConnection.providerId === Provider.Etherscan) {
            this.provider = new providers.EtherscanProvider(this.network, apiToken);
        } else if (transportConnection.providerId === Provider.JsonRpc) {
            this.provider = new providers.JsonRpcProvider(url, this.network);
        } else {
            throw new MultivestError('unknown provider');
        }
    }

    public getNetworkId() {
        return this.network;
    }

    public getServiceId() {
        return 'ethers.ethereum.transport.service';
    }

    public getBlockByHash(hash: string) {
        return this.provider.getBlock(hash);
    }

    public getBlockHeight(): Promise<number> {
        return this.provider.getBlockNumber();
    }

    public async getBlockByHeight(blockHeight: number): Promise<Block> {
        const block = await this.provider.getBlock(blockHeight);

        block.transactions = await Promise.all(
            block.transactions.map((txHash: string) => this.getTransactionByHash(txHash))
        );

        return this.convertBlock(block);
    }

    public async getTransactionByHash(txHash: string) {
        const tx = await this.provider.getTransaction(txHash);

        return this.convertTransaction(tx);
    }

    // TODO: test it
    public async sendRawTransaction(txHex: string, projectId?: string): Promise<EthereumTransaction> {
        const hash = this.provider.sendTransaction(txHex);

        return this.convertTransactionFromHash(hash);
    }

    public async convertTransactionFromHash(hash: string) {
        const tx = new EthJsTransaction(hash);

        return this.convertTransaction(tx);
    }

    public async call(tx: EthereumTransaction): Promise<string> {
        return this.provider.call({
            to: tx.to,
            nonce: tx.nonce,
            gasLimit: tx.gasLimit,
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
        return this.provider.estimateGas(transaction);
    }

    public async getGasPrice(): Promise<BigNumber> {
        const price = (await this.provider.getGasPrice()) as BigNumber;

        return price;
    }

    public async getCode(address: string): Promise<string> {
        return this.provider.getCode(address);
    }

    public async getTransactionReceipt(txHex: string): Promise<EthereumTransactionReceipt> {
        const receipt = await this.provider.getTransactionReceipt(txHex);

        return this.convertTransactionReceipt(receipt);
    }

    public async getAddressTransactionsCount(address: string, blockTag?: number | string): Promise<number> {
        const count: number = await this.provider.getTransactionCount(address, blockTag);

        return count;
    }

    private convertBlock(block: any): EthereumBlock {
        return {
            height: block.number,
            hash: block.hash,
            parentHash: block.parentHash,
            difficulty: block.difficulty,
            time: block.timestamp,
            nonce: block.nonce,

            network: ETHEREUM,
            size: block.size,
            transactions: block.transactions,
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

            fee: tx.gasPrice.mul(tx.gasLimit),
            from: [{ address: tx.from }],
            to: [{
                address: tx.to,
                amount: tx.value
            }],

            gasLimit: tx.gasLimit,
            gasPrice: tx.gasPrice,
            nonce: tx.nonce,
            input: tx.input,
            transactionIndex: tx.transactionIndex
        } as EthereumTransaction;
    }

    private convertTransactionReceipt(receipt: any): EthereumTransactionReceipt {
        const cumulativeGasUsed = receipt.cumulativeGasUsed
            ? receipt.cumulativeGasUsed.toString()
            : receipt.cumulativeGasUsed;

        return {
            blockHash: receipt.blockHash,
            blockNumber: receipt.blockNumber,
            byzantium: receipt.byzantium,
            contractAddress: receipt.contractAddress,
            cumulativeGasUsed,
            from: receipt.from,
            gasUsed: receipt.gasUsed ? receipt.gasUsed.toNumber() : receipt.gasUsed,
            logs: receipt.logs,
            logsBloom: receipt.logsBloom,
            root: receipt.root,
            status: receipt.status,
            transactionHash: receipt.transactionHash,
            transactionIndex: receipt.transactionIndex,
        } as EthereumTransactionReceipt;
    }
}
