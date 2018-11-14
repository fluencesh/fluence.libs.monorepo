import { MultivestError, PluginManager } from '@applicature-private/core.plugin-manager';
import { Scheme } from '@applicature-private/fluence.lib.services';
import BigNumber from 'bignumber.js';
import {
    Transaction as BitcoinLibTx,
} from 'bitcoinjs-lib';
import { get, has } from 'lodash';
import * as request from 'request-promise';
import { resolve } from 'url';
import * as logger from 'winston';
import { STD_VALUE_MULTIPLIER } from '../../constants';
import { Errors } from '../../errors';
import { AbstractBitcoinTransportProvider } from './abstract.bitcoin.transport.provider';
import { BitcoinTransaction, BitcoinBlock } from '../../types';

interface BiWalletSettings {
    id: string;
    password: string;
    secondPassword: string;
}

export class BiBitcoinTransportService extends AbstractBitcoinTransportProvider {
    private baseUrl: string;
    private wallet: BiWalletSettings;
    private apiKey: string;

    constructor(pluginManager: PluginManager, transportConnection: Scheme.TransportConnection) {
        super(pluginManager, transportConnection);

        this.baseUrl = get(transportConnection, 'settings.url', null);

        if (!this.baseUrl) {
            throw new MultivestError(Errors.PROVIDER_URL_REQUIRED);
        }

        // NOTICE: required for extended request limit (5 req per sec || ~21k per 8 hour)
        this.apiKey = get(transportConnection, 'settings.apiKey', null);

        // NOTICE: required for sending tx
        this.wallet = get(transportConnection, 'settings.wallet', {});
    }

    public getServiceId() {
        return `blockchain.info.bitcoin.${ this.networkId }.transport.service`;
    }

    public getTransportId() {
        return `blockchain.info.bitcoin.${ this.networkId }.transport.service`;
    }

    public getTransportConnection(): Scheme.TransportConnection {
        return this.transportConnection;
    }

    public async getBlockHeight(): Promise<number> {
        try {
            const response = await this.getRequest('q/getblockcount');
            return Number.parseInt(response);
        } catch (ex) {
            logger.error(`Can't get block height. reason: ${ ex.message }`);
            return null;
        }
    }

    public async getBlockByHash(hash: string) {
        const preparedHash = this.prepareHash(hash);

        try {
            const block = await this.getRequest(`rawblock/${ preparedHash }`);

            if (typeof block === 'string') {
                throw new MultivestError(block);
            }
    
            return this.convertBlock(block, true);
        } catch (ex) {
            logger.error(`Can't get block [${ hash }]. reason: ${ ex.message }`);
            return null;
        }
    }

    public async getBlockByHeight(blockHeight: number) {
        try {
            const response: { blocks: Array<any> } = await this.getRequest(`/block-height/${ blockHeight }`);

            if (typeof response === 'string') {
                throw new MultivestError(response);
            } else if (typeof response.blocks[0] === 'string') {
                throw new MultivestError(response.blocks[0]);
            }
    
            return this.convertBlock(response.blocks[0], true);
        } catch (ex) {
            logger.error(`Can't get block by height [${ blockHeight }]. reason: ${ ex.message }`);
            return null;
        }
    }

    public async getTransactionByHash(txHash: string) {
        const preparedHash = this.prepareHash(txHash);

        try {
            const tx = await this.getRequest(`/rawtx/${ preparedHash }`);

            if (typeof tx === 'string') {
                throw new MultivestError(tx);
            }
    
            return this.convertTransaction(tx);
        } catch (ex) {
            logger.error(`Can't get tx [${ txHash }]. reason: ${ ex.message }`);
            return null;
        }
    }

    public async sendRawTransaction(txHex: string): Promise<BitcoinTransaction> {
        try {
            await this.postRequest('pushtx', txHex);
        } catch (ex) {
            logger.error(`Can't send tx. reason: ${ ex.message }`);
            return null;
        }

        const txHash = BitcoinLibTx.fromHex(txHex).getHash().toString('utf8');

        const tx = await this.getTransactionByHash(txHash);

        return tx;
    }

    public async getBalance(address: string, minConf = 1) {
        const preparedAddress = this.prepareHash(address);

        try {
            const response = await this.getRequest(
                `/q/addressbalance/${ preparedAddress }`,
                { confirmations: minConf }
            );
    
            return new BigNumber(response).div(STD_VALUE_MULTIPLIER);
        } catch (ex) {
            logger.error(`Can't get balance of address [${ address }]. reason: ${ ex.message }`);
            return null;
        }
    }

    private convertBlock(block: any, deepConvert: boolean = false): BitcoinBlock {
        const convertedBlock = {
            fee: new BigNumber(block.fee) as any,
            hash: `0x${block.hash}`,
            height: block.height,
            network: this.networkId,
            nonce: block.nonce,
            parentHash: `0x${block.prev_block}`,
            size: block.size,
            time: block.time,
        } as BitcoinBlock;

        if (deepConvert) {
            const txs = block.tx.map((tx: any) => {
                const convertedTx = this.convertTransaction(tx);

                convertedTx.blockHash = convertedBlock.hash;
                convertedTx.blockHeight = convertedBlock.height;
                convertedTx.blockTime = convertedBlock.time;

                return convertedTx;
            });

            convertedBlock.transactions = txs;
        } else {
            convertedBlock.transactions = block.tx;
        }

        return convertedBlock;
    }

    private convertTransaction(tx: any): BitcoinTransaction {
        const senderAddressPath = 'inputs[0].prev_out.addr';
        const senderAddress = has(tx, senderAddressPath) ? `0x${get(tx, senderAddressPath)}` : null;

        return {
            hash: `0x${tx.hash}`,

            from: [{
                address: senderAddress
            }],
            to: tx.out.map((recipient: any) => ({
                address: recipient.addr,
                amount: new BigNumber(recipient.value).div(STD_VALUE_MULTIPLIER)
            })),
        } as BitcoinTransaction;
    }

    private getRequest(path: string, qs: any = {}) {
        qs.format = 'json';
        
        if (this.apiKey) {
            // CHECK: does `api_key` correct query param for specifying API key?
            qs.api_key = this.apiKey;
        }

        return request(
            resolve(this.baseUrl, path),
            {
                json: true,
                method: 'GET',
                qs,
            }
        );
    }

    private postRequest(path: string, body: any) {
        return request(
            resolve(this.baseUrl, path),
            {
                body,
                json: true,
                method: 'POST',
            }
        );
    }
}
