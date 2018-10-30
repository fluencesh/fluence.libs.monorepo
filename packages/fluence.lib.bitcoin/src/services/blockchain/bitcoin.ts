import {
    BlockchainService,
    Scheme,
    Signature
} from '@applicature-private/fluence.lib.services';
import { BigNumber } from 'bignumber.js';
import * as Client from 'bitcoin-core';
import {
  Block as OriginalBlock,
  Transaction as OriginalTransaction
} from 'bitcoin-core';
import * as bitcoin from 'bitcoinjs-lib';
import * as config from 'config';
import { BITCOIN } from './model';

type NetworkName = 'bitcoin' | 'litecoin' | 'testnet';

export class BitcoinBlockchainService extends BlockchainService {
  private client: Client;
  private networkName: NetworkName;
  private network: bitcoin.Network;
  private masterPublicKey: string;

  constructor(fake?: boolean) {
    super();

    if (!fake) {
      this.client = new Client(
        config.get('multivest.blockchain.bitcoin.providers.native')
      );
    }

    this.networkName = config.get(
      'multivest.blockchain.bitcoin.network'
    ) as NetworkName;
    this.network = bitcoin.networks[this.networkName];
    this.masterPublicKey = config.get(
      'multivest.blockchain.bitcoin.hd.masterPublicKey'
    );
  }

  public getBlockchainId() {
    return BITCOIN;
  }

  public getSymbol() {
    return 'BTC';
  }

  public getHDAddress(index: number) {
    const hdNode = bitcoin.HDNode.fromBase58(
      this.masterPublicKey,
      this.network
    );

    return hdNode
      .derive(0)
      .derive(index)
      .getAddress()
      .toString();
  }

  public isValidAddress(address: string) {
    try {
      bitcoin.address.fromBase58Check(address);
    } catch (e) {
      return false;
    }

    return true;
  }

  public async getBlockHeight() {
    return this.client.getBlockCount();
  }

  public parseBlock(block: OriginalBlock): Scheme.BlockchainBlock {
    return {
      difficulty: block.difficulty,
      fee: null,
      hash: block.hash,
      height: block.height,
      network: this.networkName,
      nonce: block.nonce,
      parentHash: block.previousblockhash,
      size: block.size,
      time: block.time,
      transactions: block.tx.map((tx: any) =>
        this.convertTransaction(block, tx)
      )
    };
  }

  public convertTransaction(block: OriginalBlock, tx: any): Scheme.BlockchainTransaction {
    const senders: Array<Scheme.Sender> = [];
    const recipients: Array<Scheme.Recipient> = [];
    tx.vout.forEach((vout: any) => {
      if (
        vout.scriptPubKey &&
        vout.scriptPubKey.addresses &&
        vout.scriptPubKey.addresses[0]
      ) {
        recipients.push({
          address: vout.scriptPubKey.addresses[0],
          amount: new BigNumber(100000000).times(vout.value)
        });
      }
    });

    const result: Scheme.BlockchainTransaction = {
      blockHash: block.hash,
      blockHeight: block.height,
      blockTime: block.time,
      fee: null,
      from: senders,
      hash: tx.hash,
      to: recipients
    };
    return result;
  }

  public parseTransaction(transaction: OriginalTransaction): Scheme.BlockchainTransaction {
    const senders: Array<Scheme.Sender> = [];
    const recipients: Array<Scheme.Recipient> = [];

    transaction.details.forEach((item: any) => {
      if (item.category === 'send') {
        senders.push({
          address: item.address
        });
      } else {
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
      to: recipients
    };
  }

  public async getBlockByHeight(blockHeight: number) {
    const blockHash = await this.client.getBlockHash(blockHeight);
    const block = await this.client.getBlockByHash(blockHash, {
      extension: 'json'
    });
    return this.parseBlock(block);
  }

  public async getTransactionByHash(txHash: string) {
    const tx = await this.client.getTransactionByHash(txHash, {
      extension: 'json',
      summary: true
    });
    return this.parseTransaction(tx);
  }

  public async sendTransaction(transaction: Partial<Scheme.BlockchainTransaction>) {
    return this.client.sendToAddress(
      transaction.to[0].address.toString(),
      transaction.to[0].amount.toString()
    );
  }

  public sendRawTransaction(txHex: string) {
    return this.client.sendRawTransaction(txHex);
  }

  public async getBalance(address: string, minConf = 1) {
    return new BigNumber(await this.client.getBalance(address, minConf));
  }
}
