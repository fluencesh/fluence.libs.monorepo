// const config = require('config');
// const bitcoin = require('bitcoinjs-lib');
// const Client = require('bitcoin-core');

// const { AbstractBlockchain } = require('@applicature/multivest.core');

// const BlockchainConstant = require('../constants/bitcoin.constant');
import * as config from 'config';
import { Client } from 'bitcoin-core';
import * as bitcoin from 'bitcoinjs-lib';
import { BlockchainService } from '@applicature/multivest.core';

export class BitcoinService extends BlockchainService {
    private client: Client;
    private network: bitcoin.Network;
    private masterPublicKey: string

    constructor(fake) {
        super();

        if (!!fake === false) {
            this.client = new Client(config.get('multivest.blockchain.bitcoin.providers.native'));
        }

        this.network = bitcoin.networks[
            config.get('multivest.blockchain.bitcoin.network') as 'bitcoin' | 'litecoin' | 'testnet'
        ];
        this.masterPublicKey = config.get('multivest.blockchain.bitcoin.hd.masterPublicKey');
    }


// eslint-disable-next-line class-methods-use-this
    getBlockchainId() {
        return BlockchainConstant.BITCOIN;
    }

// eslint-disable-next-line class-methods-use-this
    getSymbol() {
        return 'BTC';
    }

    getHDAddress(index) {
        const hdNode = bitcoin.HDNode.fromBase58(this.masterPublicKey, this.network);

        return hdNode.derive(0).derive(index).getAddress().toString();
    }

// eslint-disable-next-line class-methods-use-this
    isValidAddress(address) {
        try {
            bitcoin.Address.fromBase58Check(address);
        }
        catch (e) {
            return false;
        }

        return true;
    }

    async getBlockHeight() {
        return this.client.getBlockCount();
    }

    async getBlockByHeight(blockHeight) {
        const blockHash = await this.client.getBlockHash(blockHeight);

        return this.client.getBlockByHash(blockHash, { extension: 'json' });
    }

    async getTransactionByHash(txHash) {
        const tx = await this.client.getTransactionByHash(txHash, { extension: 'json', summary: true });

        return tx;
    }

    sendTransaction(from, to, amount, fee) {
        return this.client.sendTransaction(from, to, amount, fee);
    }

    sendRawTransaction(txHex) {
        return this.client.sendRawTransaction(txHex);
    }

    getBalance(address, minConf = 1) {
        return this.client.getBalance(address, minConf);
    }
}
