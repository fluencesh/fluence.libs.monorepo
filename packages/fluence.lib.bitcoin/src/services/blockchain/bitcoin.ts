
import { PluginManager, MultivestError } from '@applicature-private/core.plugin-manager';
import { BlockchainService, Signature } from '@applicature-private/fluence.lib.services';
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

        const network = this.getNetworkId() === AvailableNetwork.MAIN_NET
            ? bitcoin.networks.bitcoin
            : bitcoin.networks.testnet;

        const hdNode = bitcoin.HDNode.fromBase58(masterPubKey, network);

        return hdNode.derive(0).derive(index).getAddress().toString();
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
        
        const tx = new bitcoin.TransactionBuilder();
        tx.addInput(txData.hash, 0);
        tx.addOutput(txData.to[0].address, txData.to[0].amount.toNumber());
        tx.sign(0, key);

        return tx.build().toHex();
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
