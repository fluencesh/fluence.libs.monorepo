
import * as config from 'config';
import { Client, Block as OriginalBlock, Transaction as OriginalTransaction } from 'bitcoin-core';
import * as bitcoin from 'bitcoinjs-lib';
import { BigNumber } from 'bignumber.js';
import { Block, BlockchainService, Transaction, Sender, Recipient } from '@applicature/multivest.blockchain';
import { BITCOIN } from './model';

export class BitcoinBlockchainService extends BlockchainService {
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

    parseBlock(block: OriginalBlock): Block {
        const totalFee = block.tx.reduce(
            (prev, curr) => prev.plus(curr), 
            new BigNumber(0)
        );

        return {
            height: block.height,
            hash: block.hash,
            parentHash: block.previousblockhash,
            difficulty: block.difficulty,
            nonce: block.nonce,
            size: block.size,
            time: block.time,
            network: String(this.network),
            fee: totalFee,
            transactions: null
        };
    }

    parseTransaction(transaction: OriginalTransaction): Transaction {
        const senders: Sender[] = [];
        const recipients: Recipient[] = [];

        transaction.details.forEach(item => {
            if (item.category === 'send') {
                senders.push({ 
                    address: item.address 
                });
            }
            else {
                recipients.push({
                   address: item.address,
                   amount: new BigNumber(item.amount).toString()
                });
            }
        });

        return {
            hash: transaction.txid,
            blockHash: transaction.blockhash,
            blockHeight: transaction.blockindex,
            fee: transaction.fee,
            from: senders,
            to: recipients            
        }
    }

    async getBlockByHeight(blockHeight: number) {
        const blockHash = await this.client.getBlockHash(blockHeight);
        const block = await this.client.getBlockByHash(blockHash, { extension: 'json' });
        return this.parseBlock(block);
    }

    async getTransactionByHash(txHash: string) {
        const tx = await this.client.getTransactionByHash(txHash, { extension: 'json', summary: true });
        return this.parseTransaction(tx);
    }

    async sendTransaction(transaction: Partial<Transaction>) {
        return this.client.sendToAddress( 
            transaction.to[0].address,
            transaction.to[0].amount
        );
    }

    sendRawTransaction(txHex: string) {
        return this.client.sendRawTransaction(txHex);
    }

    async getBalance(address: string, minConf = 1) {
        return new BigNumber(
            await this.client.getBalance(address, minConf)
        );
    }
}
