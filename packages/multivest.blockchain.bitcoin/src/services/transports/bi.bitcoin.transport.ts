import { Scheme } from '@applicature-restricted/multivest.services.blockchain';
import { Block, MultivestError, PluginManager, Service, Transaction } from '@applicature/multivest.core';
import BigNumber from 'bignumber.js';
import {
    address as BitcoinLibAddress,
    HDNode,
    networks as BitcoinLibNetworks,
    Transaction as BitcoinLibTx,
} from 'bitcoinjs-lib';
import * as config from 'config';
import { get, has } from 'lodash';
import * as request from 'request-promise';
import { resolve } from 'url';
import { STD_VALUE_MULTIPLIER } from '../../constants';
import { Errors } from '../../errors';
import { AvailableNetwork } from '../../types';
import { AbstractBitcoinTransportService } from './abstract.bitcoin.transport';
import { BitcoinTransport } from './bitcoin.transport';

interface BiWalletSettings {
    id: string;
    password: string;
    secondPassword: string;
}

export class BiBitcoinTransportService extends AbstractBitcoinTransportService {
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
        const response = await this.getRequest('q/getblockcount');

        return Number.parseInt(response);
    }

    public async getBlockByHash(hash: string) {
        const preparedHash = this.prepareHash(hash);

        const block = await this.getRequest(`rawblock/${ preparedHash }`);

        return this.convertBlock(block, true);
    }

    public async getBlockByHeight(blockHeight: number) {
        const response: { blocks: Array<any> } = await this.getRequest(`/block-height/${ blockHeight }`);

        return this.convertBlock(response.blocks[0], true);
    }

    public async getTransactionByHash(txHash: string) {
        const preparedHash = this.prepareHash(txHash);

        const tx = await this.getRequest(`/rawtx/${ preparedHash }`);

        return this.convertTransaction(tx);
    }

    public async sendRawTransaction(txHex: string): Promise<Transaction> {
        await this.postRequest('pushtx', txHex);

        const txHash = BitcoinLibTx.fromHex(txHex).getHash().toString('utf8');

        const tx = await this.getTransactionByHash(txHash);

        return tx;
    }

    public async getBalance(address: string, minConf = 1) {
        const preparedAddress = this.prepareHash(address);

        const response = await this.getRequest(`/q/addressbalance/${ preparedAddress }`, { confirmations: minConf });

        return new BigNumber(response).div(STD_VALUE_MULTIPLIER);
    }

    private convertBlock(block: any, deepConvert: boolean = false): Block {
        const convertedBlock = {
            fee: new BigNumber(block.fee),
            hash: `0x${block.hash}`,
            height: block.height,
            network: this.networkId,
            nonce: block.nonce,
            parentHash: `0x${block.prev_block}`,
            size: block.size,
            time: block.time,
        } as Block;

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

    private convertTransaction(tx: any): Transaction {
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
        } as Transaction;
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
