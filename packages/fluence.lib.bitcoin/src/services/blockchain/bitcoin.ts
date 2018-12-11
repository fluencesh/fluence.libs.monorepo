import { PluginManager, MultivestError } from '@applicature/synth.plugin-manager';
import { BlockchainService, Signature } from '@fluencesh/fluence.lib.services';
import * as bitcoin from 'bitcoinjs-lib';
import * as config from 'config';
import { BITCOIN } from '../../constants';
import {
    AvailableNetwork,
    BitcoinTransaction,
    BitcoinBlock
} from '../../types';
import { ManagedBitcoinTransportService } from '../transports/managed.bitcoin.transport.service';
import { Errors } from '../../errors';
import { BitcoinTransportProvider } from '../transports/interfaces/bitcoin.transport.provider';
import { ManagedBitcoinTransport } from '../transports/interfaces/managed.bitcoin.transport';

export class BitcoinBlockchainService extends BlockchainService<
    BitcoinTransaction,
    BitcoinBlock,
    BitcoinTransportProvider,
    ManagedBitcoinTransport
> {
    constructor(pluginManager: PluginManager, blockchainTransport: ManagedBitcoinTransportService) {
        super(pluginManager, blockchainTransport);
    }

    public getBlockchainId() {
        return BITCOIN;
    }

    public getSymbol() {
        return 'BTC';
    }

    public getServiceId() {
        return `bitcoin.${ this.getNetworkId() }.blockchain.service`;
    }

    public isValidNetwork(network: string) {
        return AvailableNetwork.MAIN_NET === network || AvailableNetwork.TEST_NET === network;
    }

    public async getHDAddress(index: number): Promise<string> {
        const masterPubKey = config.has('multivest.blockchain.bitcoin.hd.masterPublicKey')
            ? config.get<string>('multivest.blockchain.bitcoin.hd.masterPublicKey')
            : null;

        if (!masterPubKey) {
            throw new MultivestError(Errors.MASTER_PUBLIC_KEY_REQUIRED);
        }

        let hdNode: bitcoin.HDNode;
        if (masterPubKey.startsWith('xpub') && this.getNetworkId() === AvailableNetwork.MAIN_NET) {
            hdNode = bitcoin.HDNode.fromBase58(masterPubKey, this.getBitcoinLibNetwork());
        } else if (masterPubKey.startsWith('tpub') && this.getNetworkId() === AvailableNetwork.TEST_NET) {
            hdNode = bitcoin.HDNode.fromBase58(masterPubKey, this.getBitcoinLibNetwork());
        } else {
            throw new MultivestError(Errors.UNKNOWN_BITCOIN_FORMAT);
        }

        const address = hdNode.derive(0).derive(index).getAddress().toString()
        return `0x${ address }`;
    }

    public isValidAddress(address: string): boolean {
        const preparedHash = address.indexOf('0x') === 0 ? address.slice(2) : address;

        try {
            bitcoin.address.fromBase58Check(preparedHash);
            return true;
        } catch (ex) {
            return false;
        }
    }

    public signTransaction(privateKey: Buffer, txData: BitcoinTransaction): string {
        const network = this.getBitcoinLibNetwork();

        const key = bitcoin.ECPair.fromWIF(privateKey.toString('utf8'), network);

        const txHash = txData.hash;
        const preparedTxHash = txHash.startsWith('0x') ? txHash.slice(2) : txHash;
        const address = txData.to[0].address;
        const preparedAddress = address.startsWith('0x') ? address.slice(2) : address;
        
        const tx = new bitcoin.TransactionBuilder(network);
        tx.addInput(preparedTxHash, 0);
        tx.addOutput(preparedAddress, txData.to[0].amount.toNumber());
        tx.sign(0, key);

        const hex = tx.build().toHex()
        return `0x${ hex }`;
    }

    public signData(privateKey: Buffer, data: Buffer): Signature {
        const network = this.getBitcoinLibNetwork();
        const keyPair = bitcoin.ECPair.fromWIF(privateKey.toString('utf8'), network);
        const signature = keyPair.sign(data) as any;

        // HACK: props `r` and `s` are hidden by `bitcoin-lib`'s declaration. their type is BigInteger.
        return {
            r: signature.r.toBuffer(32),
            s: signature.s.toBuffer(32)
        } as Signature;
    }

    public signDataAndStringify(privateKey: Buffer, data: Buffer): string {
        const signature = this.signData(privateKey, data);
        const hex = Buffer.alloc(64, Buffer.concat([ signature.r, signature.s ])).toString('hex');

        return `0x${ hex }`;
    }

    private getBitcoinLibNetwork(): bitcoin.Network {
        return this.getNetworkId() === AvailableNetwork.MAIN_NET
            ? bitcoin.networks.bitcoin
            : bitcoin.networks.testnet;
    }
}
