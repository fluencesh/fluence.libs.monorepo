import { MultivestError, PluginManager, Service } from '@applicature/synth.plugin-manager';
import { Scheme } from '@fluencesh/fluence.lib.services';
import BigNumber from 'bignumber.js';
import { get } from 'lodash';
import * as logger from 'winston';
import { LitecoinBlock, LitecoinTransaction } from '../../types';
import { Errors } from '../../errors';
import { LITECOIN } from '../../constants';
import { LitecoinTransportProvider } from './interfaces';

// tslint:disable-next-line:no-var-requires
const Client = require('bitcoin-core');

export class BcLitecoinTransportService extends Service implements LitecoinTransportProvider {
    protected networkId: string;
    protected transportConnection: Scheme.TransportConnection;

    private client: any;

    constructor(pluginManager: PluginManager, transportConnection: Scheme.TransportConnection) {
        super(pluginManager);

        this.transportConnection = transportConnection;
        this.networkId = transportConnection.networkId;

        this.networkId = this.transportConnection.networkId;
        this.client = new Client(this.transportConnection.settings);
    }

    public getBlockchainId() {
        return LITECOIN;
    }

    public getNetworkId() {
        return this.networkId;
    }

    public getTransportConnection() {
        return this.transportConnection;
    }

    public getServiceId() {
        return `bitcoin.core.litecoin.${ this.networkId }.transport.service`;
    }

    public getTransportId() {
        return `bitcoin.core.litecoin.${ this.networkId }.transport.service`;
    }

    public async getBalance(address: string, minConf: number = 1): Promise<BigNumber> {
        const preparedHash = this.prepareHash(address);

        try {
            const balance = await this.client.getBalance(preparedHash, minConf);
    
            return new BigNumber(balance);
        } catch (ex) {
            logger.error(`Can't get balance of address [${ address }]. reason: ${ ex.message }`);
            throw ex;
        }
    }

    public async getBlockByHash(hash: string): Promise<LitecoinBlock> {
        const preparedHash = this.prepareHash(hash);

        try {
            const block = await this.client.getBlockByHash(preparedHash, { extension: 'json' });
            
            if (typeof block === 'string') {
                throw new MultivestError(block);
            }

            return this.convertBlock(block);
        } catch (ex) {
            logger.error(`Can't get block [${ hash }]. reason: ${ ex.message }`);
            throw ex;
        }
    }
    
    public async getBlockByHeight(height: number): Promise<LitecoinBlock> {
        const hash = await this.client.getBlockHash(height);
        
        return this.getBlockByHash(hash);
    }

    public async getBlockHeight(): Promise<number> {
        try {
            const blockCount = await this.client.getBlockCount();

            return blockCount;
        } catch (ex) {
            logger.error(`Can't get height of blocks. reason: ${ ex.message }`);
            throw ex;
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
            throw ex;
        }

        const block = await this.getBlockByHash(tx.blockhash);

        return this.convertTransaction(tx, block);
    }

    public async sendRawTransaction(txHex: string): Promise<LitecoinTransaction> {
        let hash: string;
        try {
            hash = await this.client.sendRawTransaction(txHex);
        } catch (ex) {
            logger.error(`Sending of tx was failed. reason: ${ ex.message }`);
            throw ex;
        }

        return this.getTransactionByHash(hash);
    }

    public async estimateFee(tx: LitecoinTransaction): Promise<BigNumber> {
        // NOTICE: no such method for bitcoin
        // https://en.bitcoin.it/wiki/Original_Bitcoin_client/API_calls_list
        throw new MultivestError(Errors.NOT_IMPLEMENTED);
    }

    protected prepareHash(hash: string) {
        return hash.indexOf('0x') === 0 ? hash.slice(2) : hash;
    }

    private async getCoreTransactionByHash(txHash: string) {
        const preparedHash = this.prepareHash(txHash);

        return this.client.getTransactionByHash(preparedHash);
    }

    private convertBlock(block: any): LitecoinBlock {
        const convertedBlock = {
            difficulty: block.difficulty,
            hash: `0x${block.hash}`,
            height: block.height,
            network: this.networkId,
            nonce: block.nonce,
            parentHash: block.previousblockhash,
            size: block.size,
            time: block.time
        } as LitecoinBlock;

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

    private convertTransaction(tx: any, block: LitecoinBlock = {} as LitecoinBlock): LitecoinTransaction {
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
        } as LitecoinTransaction;

        if (Object.keys(block).length > 0) {
            convertedTx.blockHeight = block.height;
            convertedTx.blockTime = block.time;
        }

        return convertedTx;
    }
}
