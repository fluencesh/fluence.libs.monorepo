const config = 'config';
const bitcoin = 'bitcoinjs-lib';
const Client = 'bitcoin-core';

const { AbstractBlockchain } = require('@applicature/multivest.core');

class BitcoinService extends AbstractBlockchain {
    constructor(fake) {
        super();

        if (!!fake === false) {
            this.client = new Client(config.get('blockchain.bitcoin.providers.native'));
        }

        this.network = bitcoin.networks[config.get('blockchain.bitcoin.network')];
        this.masterPublicKey = config.get('blockchain.bitcoin.hd.masterPublicKey');
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

module.exports = BitcoinService;
