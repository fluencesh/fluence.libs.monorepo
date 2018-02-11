import { BlockchainService } from '@applicature-restricted/multivest.blockchain';
import { MultivestError, PluginManager } from '@applicature/multivest.core';
import { BigNumber } from 'bignumber.js';
import * as config from 'config';
import EthereumBip44 from 'ethereum-bip44';
import * as Web3 from 'web3';
import { ETHEREUM, EthereumTransaction } from './model';
import * as EthereumTx from 'ethereumjs-tx';

export class EthereumBlockchainService extends BlockchainService {
    private client: Web3;
    private chainId: string;
    private signerPrivateKey: string;

    constructor(fake, signerPrivateKey) {
        super();

        if (!fake) {
            const clientProvider = new Web3.providers.HttpProvider(
                config.get('multivest.blockchain.ethereum.providers.native.url')
            );

            this.client = new Web3(clientProvider);

            this.chainId = config.get('multivest.blockchain.ethereum.chainId');

            this.signerPrivateKey = signerPrivateKey || config.get('multivest.blockchain.ethereum.senderPrivateAddress');
        }
    }

    public getServiceId() {
        return 'blockchain.ethereum';
    }

    public getBlockchainId() {
        return ETHEREUM;
    }

    public getSymbol() {
        return 'ETH';
    }

    public getContract(abi: Array<Web3.AbiDefinition>, address: string) {
        const Contract = this.client.eth.contract(abi);
        return Contract.at(address);
    }

    public getHDAddress(index: number) {
        const masterPublicKey = config.get('multivest.blockchain.ethereum.hd.masterPublicKey');
        const wallet = EthereumBip44.fromPublicSeed(masterPublicKey);
        return wallet.getAddress(index);
    }

    public isValidAddress(address: string) {
        return Web3.utils.isAddress(address);
    }

    public getBlockHeight(): Promise<number> {
        return new Promise((resolve, reject) => {
            this.client.eth.getBlockNumber((err, blockNumber) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(blockNumber);
            });
        });
    }

    public async getBlockByHeight(blockHeight: number) {
        return this.client.eth.getBlock(blockHeight, true) as any;
    }

    public async getTransactionByHash(txHash: string) {
        return this.client.eth.getTransaction(txHash) as any;
    }

    public async sendTransaction(data: Partial<EthereumTransaction>) {
        return new Promise<string>(async (resolve, reject) => {
            const txParams = {
                nonce: `0x${data.nonce.toString(16)}`,
                gasPrice: `0x${new BigNumber(data.gasPrice).toString(16)}`,
                gasLimit: `0x${new BigNumber(data.gas).toString(16)}`,

                to: data.to[0].address,
                value: `0x${data.to[0].amount.toString(16)}`,

                data: data.input,

                chainId: this.chainId,
            };

            const tx = new EthereumTx(txParams);

            tx.sign(Buffer.from(this.signerPrivateKey.substr(2), 'hex'));

            const serializedTx = tx.serialize();

            await this.sendRawTransaction(serializedTx);

            return tx.hash();
        });
    }

    public async sendRawTransaction(txHex: string) {
        return this.client.eth.sendRawTransaction(txHex);
    }

    public async call(from: string, to: string, data: string) {
        return this.client.eth.call({
            data,
            from,
            to,
        });
    }

    public async sign(address: string, data: string) {
        return this.client.eth.sign(address, data);
    }

    public async getBalance(address: string, minConf: number) {
        if (minConf && minConf > 0) {
            throw new MultivestError('minConf is not supported');
        }

        return this.client.eth.getBalance(address);
    }

    public async estimateGas(from: string, to: string, data: string) {
        return this.client.eth.estimateGas({
            data,
            from,
            to,
        });
    }
}
