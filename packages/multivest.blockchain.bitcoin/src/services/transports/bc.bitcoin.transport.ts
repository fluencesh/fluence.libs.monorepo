import { Scheme } from '@applicature-restricted/multivest.services.blockchain';
import { Block, PluginManager, Service, Transaction } from '@applicature/multivest.core';
import BigNumber from 'bignumber.js';
import * as Client from 'bitcoin-core';
import { get, has } from 'lodash';
import { STD_VALUE_MULTIPLIER } from '../../constants';
import { AbstractBitcoinTransportService } from './abstract.bitcoin.transport';
import { BitcoinTransport } from './bitcoin.transport';

export class BcBitcoinTransportService extends AbstractBitcoinTransportService {
    protected client: Client;

    constructor(pluginManager: PluginManager, transportConnection: Scheme.TransportConnection) {
        super(pluginManager, transportConnection);

        this.client = new Client(this.transportConnection.settings);
    }

    public getServiceId() {
        return `bitcoin.core.bitcoin.${ this.networkId }.transport.service`;
    }

    public getTransportId() {
        return `bitcoin.core.bitcoin.${ this.networkId }.transport.service`;
    }

    public async getBalance(address: string, minConf: number = 1): Promise<BigNumber> {
        const preparedHash = this.prepareHash(address);

        const balance = await this.client.getBalance(preparedHash, minConf);

        return new BigNumber(balance);
    }

    public async getBlockByHash(hash: string): Promise<Block> {
        const preparedHash = this.prepareHash(hash);

        const block = await this.client.getBlockByHash(preparedHash, { extension: 'json' });

        return this.convertBlock(block);
    }
    
    public async getBlockByHeight(height: number): Promise<Block> {
        const hash = await this.client.getBlockHash(height);
        
        return this.getBlockByHash(hash);
    }

    public async getBlockHeight(): Promise<number> {
        return this.client.getBlockCount();
    }

    public async getTransactionByHash(txHash: string) {
        const preparedTxHash = this.prepareHash(txHash);

        const tx = await this.getCoreTransactionByHash(preparedTxHash);
        const block = await this.getBlockByHash(tx.blockhash);

        return this.convertTransaction(tx, block);
    }

    public async sendRawTransaction(txHex: string): Promise<Transaction> {
        const hash = await this.client.sendRawTransaction(txHex);

        return this.getTransactionByHash(hash);
    }

    private async getCoreTransactionByHash(txHash: string) {
        const preparedHash = this.prepareHash(txHash);

        return this.client.getTransactionByHash(preparedHash);
    }

    private convertBlock(block: any): Block {
        const convertedBlock = {
            difficulty: block.difficulty,
            hash: `0x${block.hash}`,
            height: block.height,
            network: this.networkId,
            nonce: block.nonce,
            parentHash: block.previousblockhash,
            size: block.size,
            time: block.time
        } as Block;

        const transactions = block.tx.map((tx: any) => {
            const convertedTx = this.convertTransaction(tx);

            convertedTx.blockHash = convertedBlock.hash;
            convertedTx.blockHeight = convertedBlock.height;
            convertedTx.blockTime = convertedBlock.time;

            return convertedTx;
        });

        convertedBlock.transactions = transactions;

        return convertedBlock;
    }

    private convertTransaction(tx: any, block: Block = {} as Block): Transaction {
        const convertedTx = {
            blockHash: `0x${tx.blockhash}`,
            hash: `0x${tx.txid}`,

            from: [{
                // NOTICE: somehow sender's address isn't filled by lib
                address: null
            }],
            to: tx.vout.map((recipient: any) => ({
                address: get(recipient, 'scriptPubKey.addresses[0]'),
                amount: new BigNumber(recipient.value)
            })),
        } as Transaction;

        if (Object.keys(block).length > 0) {
            convertedTx.blockHeight = block.height;
            convertedTx.blockTime = block.time;
        }

        return convertedTx;
    }
}
