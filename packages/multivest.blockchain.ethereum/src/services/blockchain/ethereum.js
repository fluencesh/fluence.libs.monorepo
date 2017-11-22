const config = require('config');
const EthereumBip44 = require('ethereum-bip44');
const Web3 = require('web3');

const { AbstractBlockchain, MultivestError } = require('@applicature/multivest.core');

const EthereumConstant = require('../constants/ethereum.constant');

class EthereumService extends AbstractBlockchain {
    constructor(fake) {
        super();

        if (!!fake === false) {
            this.clientProvider = new Web3.providers.HttpProvider(config.get('multivest.blockchain.ethereum.providers.native.url'));

            this.client = new Web3(this.clientProvider);
        }
    }

// eslint-disable-next-line class-methods-use-this
    getNetworkId() {
        return EthereumConstant.ETHEREUM;
    }

    getContract(abi, address) {
        const contract = new this.client.eth.Contract(abi, address);

        return contract;
    }

// eslint-disable-next-line class-methods-use-this
    getHDAddress(index) {
        const masterPublicKey = config.get('multivest.blockchain.ethereum.hd.masterPublicKey');

        const wallet = EthereumBip44.fromPublicSeed(masterPublicKey);

        return wallet.getAddress(index);
    }

// eslint-disable-next-line class-methods-use-this
    isValidAddress(address) {
        return Web3.utils.isAddress(address);
    }

    async getBlockHeight() {
        return this.client.eth.getBlockNumber();
    }

    async getBlockByHeight(blockHeight) {
        return this.client.eth.getBlock(blockHeight, true);
    }

    async getTransactionByHash(txHash) {
        return this.client.eth.getTransaction(txHash);
    }

    async sendTransaction(from, to, value, data, nonce, gasLimit, gasPrice) {
        return new Promise((resolve, reject) => {
            try {
                this.client.eth.sendTransaction({
                    from,
                    to,
                    value,
                    nonce,
                    gas: gasLimit,
                    gasPrice,
                    data,
                }, (error, txHash) => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve(txHash);
                    }
                });
            }
            catch (error) {
                reject(error);
            }
        });
    }

    async sendRawTransaction(txHex) {
        return this.client.eth.sendSignedTransaction(txHex);
    }

    async call(from, to, data) {
        return this.client.eth.call({
            from,
            to,
            data,
        });
    }

    async getBalance(address, minConf) {
        if (minConf && minConf > 0) {
            throw new MultivestError('minConf is not supported');
        }

        return this.client.eth.getBalance(address);
    }

    async estimateGas(from, to, data) {
        return this.client.eth.estimateGas({
            from,
            to,
            data,
        });
    }

// eslint-disable-next-line class-methods-use-this
    getBlockNumber(block) {
        return block.number;
    }

// eslint-disable-next-line class-methods-use-this
    getBlockTimestamp(block) {
        return block.timestamp;
    }
}

module.exports = EthereumService;
