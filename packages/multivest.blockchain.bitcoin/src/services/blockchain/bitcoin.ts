
import * as config from 'config';
import { Client } from 'bitcoin-core';
import * as bitcoin from 'bitcoinjs-lib';
import { BlockchainService, Transaction } from '@applicature/multivest.core';
import { BITCOIN } from '../constants';

export class BitcoinService extends BlockchainService {
    private client: Client;
    private network: bitcoin.Network;
    private masterPublicKey: string

    constructor(fake?: boolean) {
        super();

        if (!fake) {
            this.client = new Client(config.get('multivest.blockchain.bitcoin.providers.native'));
        }

        this.network = bitcoin.networks[
            config.get('multivest.blockchain.bitcoin.network') as 'bitcoin' | 'litecoin' | 'testnet'
        ];
        this.masterPublicKey = config.get('multivest.blockchain.bitcoin.hd.masterPublicKey');
    }

    getBlockchainId() {
        return BITCOIN;
    }

    getSymbol() {
        return 'BTC';
    }

    getHDAddress(index: number) {
        const hdNode = bitcoin.HDNode.fromBase58(this.masterPublicKey, this.network);

        return hdNode.derive(0).derive(index).getAddress().toString();
    }

    isValidAddress(address: string) {
        try {
            bitcoin.address.fromBase58Check(address);
        }
        catch (e) {
            return false;
        }

        return true;
    }

    async getBlockHeight() {
        return this.client.getBlockCount();
    }

    async getBlockByHeight(blockHeight: number) {
        const blockHash = await this.client.getBlockHash(blockHeight);

        return this.client.getBlockByHash(blockHash, { extension: 'json' });
    }

    async getTransactionByHash(txHash: string) {
        const tx = await this.client.getTransactionByHash(txHash, { extension: 'json', summary: true });

        return tx;
    }

    //@TODO: edit Transaction 
    sendTransaction(tx: Transaction) {
        return this.client.sendTransaction(
            tx.from, 
            tx.to,
            tx.amount, 
            tx.fee
        );
    }

    sendRawTransaction(txHex: string) {
        return this.client.sendRawTransaction(txHex);
    }

    getBalance(address: string, minConf = 1) {
        return this.client.getBalance(address, minConf);
    }
}
