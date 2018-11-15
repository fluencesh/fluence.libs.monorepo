import {
    BlockchainService,
    Scheme,
    BlockchainTransportProvider,
    ManagedBlockchainTransportService,
    Signature
} from '@fluencesh/fluence.lib.services';
import { BigNumber } from 'bignumber.js';
import * as bitcoin from 'bitcoinjs-lib';
import * as config from 'config';
import { BitcoinTransaction, BitcoinBlock } from '../../types';
import { BITCOIN } from '../../constants';

type NetworkName = 'bitcoin' | 'litecoin' | 'testnet';

// this is not cool, but we have not normal declaration, so works for now
// FIXME:
// tslint:disable-next-line:no-var-requires
const Client: any = require('bitcoin-core');
type OriginalBlock = any;
type OriginalTransaction = any;

export class BitcoinBlockchainService extends BlockchainService<
    BitcoinTransaction,
    BitcoinBlock,

    // TODO: transport provider and managed transport should be created even if they are not extending base service
    BlockchainTransportProvider<BitcoinTransaction, BitcoinBlock>,
    ManagedBlockchainTransportService<
        BitcoinTransaction,
        BitcoinBlock,
        BlockchainTransportProvider<BitcoinTransaction, BitcoinBlock>
    >
> {
    // NOTICE: should be a part of transport
    private client: any;
    // NOTICE: service should not keep this info, it's part of the transport
    private networkName: NetworkName;
    // NOTICE: service should not keep this info, it's part of the transport
    private network: bitcoin.Network;
    private masterPublicKey: string;

    constructor(fake?: boolean) {
        const pmMock = {
            getServiceByClass: () => ({})
        } as any;

        const transportMock = {
            getNetworkId: () => ({})
        } as any;

        // TODO: PluginManager and ManagedBlockchainService should be passed here
        super(pmMock, transportMock);

        // TODO: should be removed (may be mocked anyway, so no need to add extra parameter just for tests)
        if (!fake) {
            this.client = new Client(
                config.get('multivest.blockchain.bitcoin.providers.native')
            );
        }

        this.networkName = config.get<NetworkName>('multivest.blockchain.bitcoin.network');
        this.network = bitcoin.networks[this.networkName];
        this.masterPublicKey = config.get('multivest.blockchain.bitcoin.hd.masterPublicKey');
    }

    // TODO: should be implemented
    public getServiceId(): string {
        return null;
    }

    // TODO: should be implemented
    public isValidNetwork(): boolean {
        return true;
    }

    // TODO: should be implemented
    public signData(privateKey: Buffer, data: Buffer): Signature {
        return null;
    }

    // TODO: should be implemented
    public signDataAndStringify(privateKey: Buffer, data: Buffer): string {
        return null;
    }

    // TODO: should be implemented
    public signTransaction(privateKey: Buffer, txData: BitcoinTransaction): string {
        return null;
    }

    // TODO: should be got from transport
    public getBlockchainId() {
        return BITCOIN;
    }

    // TODO: should be got from transport
    public getSymbol() {
        return 'BTC';
    }

    public async getHDAddress(index: number): Promise<string> {
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

    // TODO: Should be implemented in transport and reused here
    public async getBlockHeight() {
        return this.client.getBlockCount();
    }

    // TODO: Should be implemented in transport, also should be private
    public parseBlock(block: OriginalBlock): BitcoinBlock {
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

    // TODO: Should be implemented in transport, also should be private
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

    // TODO: Should be implemented in transport, also should be private
    public parseTransaction(transaction: OriginalTransaction): Scheme.BlockchainTransaction {
        const senders: Array<Scheme.Sender> = [];
        const recipients: Array<Scheme.Recipient> = [];

        (transaction as any).details.forEach((item: any) => {
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

    // TODO: Should be implemented in transport and reused here
    public async getBlockByHeight(blockHeight: number) {
        const blockHash = await this.client.getBlockHash(blockHeight);
        const block = await this.client.getBlockByHash(blockHash, {
            extension: 'json'
        });
        return this.parseBlock(block);
    }

    // TODO: Should be implemented in transport
    public async getTransactionByHash(txHash: string) {
        const tx = await this.client.getTransactionByHash(txHash, {
        extension: 'json',
            summary: true
        });
        return this.parseTransaction(tx);
    }

    // NOTICE: base method should not be overridden (it's already implemented in extended class)
    public async sendTransaction(
        privateKey: Buffer,
        txData: BitcoinTransaction,
        projectId?: string,
        transportId?: string
    ): Promise<BitcoinTransaction> {
        const hash = await this.client.sendToAddress(
            txData.to[0].address.toString(),
            txData.to[0].amount.toString()
        );

        return this.getTransactionByHash(hash);
    }

    // TODO: Should be implemented in transport
    public async sendRawTransaction(txHex: string) {
        const hash = await this.client.sendRawTransaction(txHex);
        return this.getTransactionByHash(hash);
    }

    // TODO: Should be implemented in transport
    public async getBalance(address: string, minConf = 1) {
        return new BigNumber(await this.client.getBalance(address, minConf));
    }
}
