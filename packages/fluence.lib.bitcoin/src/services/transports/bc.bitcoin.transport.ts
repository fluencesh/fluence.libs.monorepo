import { MultivestError, PluginManager, Service } from '@applicature-private/core.plugin-manager';
import { Scheme } from '@applicature-private/fluence.lib.services';
import BigNumber from 'bignumber.js';
import { get } from 'lodash';
import * as logger from 'winston';
import { AbstractBitcoinTransportProvider } from './abstract.bitcoin.transport.provider';
import { BitcoinBlock, BitcoinTransaction } from '../../types';

const Client = require('bitcoin-core');

export class BcBitcoinTransportService extends AbstractBitcoinTransportProvider {
    private client: any;

    constructor(pluginManager: PluginManager, transportConnection: Scheme.TransportConnection) {
        super(pluginManager, transportConnection);

        this.networkId = this.transportConnection.networkId;
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

        try {
            const balance = await this.client.getBalance(preparedHash, minConf);
    
            return new BigNumber(balance);
        } catch (ex) {
            logger.error(`Can't get balance of address [${ address }]. reason: ${ ex.message }`);
            return null;
        }
    }

    public async getBlockByHash(hash: string): Promise<BitcoinBlock> {
        const preparedHash = this.prepareHash(hash);

        try {
            const block = await this.client.getBlockByHash(preparedHash, { extension: 'json' });
            
            if (typeof block === 'string') {
                throw new MultivestError(block);
            }

            return this.convertBlock(block);
        } catch (ex) {
            logger.error(`Can't get block [${ hash }]. reason: ${ ex.message }`);
            return null;
        }
    }
    
    public async getBlockByHeight(height: number): Promise<BitcoinBlock> {
        const hash = await this.client.getBlockHash(height);
        
        return this.getBlockByHash(hash);
    }

    public async getBlockHeight(): Promise<number> {
        try {
            const blockCount = await this.client.getBlockCount();

            return blockCount;
        } catch (ex) {
            logger.error(`Can't get height of blocks. reason: ${ ex.message }`);
            return null;
        }
    }

    public async getTransactionByHash(txHash: string) {
        const preparedTxHash = this.prepareHash(txHash);

        let tx: any;
        try {
            tx = await this.getCoreTransactionByHash(preparedTxHash);

            if (typeof tx === 'string') {
                throw new MultivestError(tx);
            }
        } catch (ex) {
            logger.error(`Can't get tx [${ txHash }]. reason: ${ ex.message }`);
            return null;
        }

        const block = await this.getBlockByHash(tx.blockhash);

        return this.convertTransaction(tx, block);
    }

    public async sendRawTransaction(txHex: string): Promise<BitcoinTransaction> {
        let hash: string;
        try {
            hash = await this.client.sendRawTransaction(txHex);
        } catch (ex) {
            logger.error(`Sending of tx was failed. reason: ${ ex.message }`);
            return null;
        }

        return this.getTransactionByHash(hash);
    }

    private async getCoreTransactionByHash(txHash: string) {
        const preparedHash = this.prepareHash(txHash);

        return this.client.getTransactionByHash(preparedHash);
    }

    private convertBlock(block: any): BitcoinBlock {
        const convertedBlock = {
            difficulty: block.difficulty,
            hash: `0x${block.hash}`,
            height: block.height,
            network: this.networkId,
            nonce: block.nonce,
            parentHash: block.previousblockhash,
            size: block.size,
            time: block.time
        } as BitcoinBlock;

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

    private convertTransaction(tx: any, block: BitcoinBlock = {} as BitcoinBlock): BitcoinTransaction {
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
        } as BitcoinTransaction;

        if (Object.keys(block).length > 0) {
            convertedTx.blockHeight = block.height;
            convertedTx.blockTime = block.time;
        }

        return convertedTx;
    }
}
