
import { BlockchainService } from '@applicature-restricted/multivest.blockchain';
import { Block, Recipient, Sender, Transaction } from '@applicature/multivest.core';
import { BigNumber } from 'bignumber.js';
import { Block as OriginalBlock, Client, Transaction as OriginalTransaction } from 'bitcoin-core';
import * as bitcoin from 'bitcoinjs-lib';
import * as config from 'config';
import { BITCOIN } from './model';

export class BitcoinBlockchainService extends BlockchainService {
    private client: Client;
    private network: bitcoin.Network;
    private masterPublicKey: string;

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

    public getBlockchainId() {
        return BITCOIN;
    }

    public getSymbol() {
        return 'BTC';
    }

    public getHDAddress(index: number) {
        const hdNode = bitcoin.HDNode.fromBase58(this.masterPublicKey, this.network);

        return hdNode.derive(0).derive(index).getAddress().toString();
    }

    public isValidAddress(address: string) {
        try {
            bitcoin.address.fromBase58Check(address);
        }
        catch (e) {
            return false;
        }

        return true;
    }

    public async getBlockHeight() {
        return this.client.getBlockCount();
    }

    public parseBlock(block: OriginalBlock): Block {
        const totalFee = block.tx.reduce(
            (prev, curr) => prev.plus(curr),
            new BigNumber(0)
        );

        return {
            difficulty: block.difficulty,
            fee: totalFee,
            hash: block.hash,
            height: block.height,
            network: String(this.network),
            nonce: block.nonce,
            parentHash: block.previousblockhash,
            size: block.size,
            time: block.time,
            transactions: null
        };
    }

    public parseTransaction(transaction: OriginalTransaction): Transaction {
        const senders: Array<Sender> = [];
        const recipients: Array<Recipient> = [];

        transaction.details.forEach((item) => {
            if (item.category === 'send') {
                senders.push({
                    address: item.address,
                });
            }
            else {
                recipients.push({
                   address: item.address,
                   amount: new BigNumber(item.amount)
                });
            }
        });

        return {
            blockHash: transaction.blockhash,
            blockHeight: transaction.blockindex,
            fee: new BigNumber(transaction.fee),
            from: senders,
            hash: transaction.txid,
            to: recipients,
        };
    }

    public async getBlockByHeight(blockHeight: number) {
        const blockHash = await this.client.getBlockHash(blockHeight);
        const block = await this.client.getBlockByHash(blockHash, { extension: 'json' });
        return this.parseBlock(block);
    }

    public async getTransactionByHash(txHash: string) {
        const tx = await this.client.getTransactionByHash(txHash, { extension: 'json', summary: true });
        return this.parseTransaction(tx);
    }

    public async sendTransaction(transaction: Partial<Transaction>) {
        return this.client.sendToAddress(
            transaction.to[0].address.toString(),
            transaction.to[0].amount.toString()
        );
    }

    public sendRawTransaction(txHex: string) {
        return this.client.sendRawTransaction(txHex);
    }

    public async getBalance(address: string, minConf = 1) {
        return new BigNumber(
            await this.client.getBalance(address, minConf)
        );
    }
}
