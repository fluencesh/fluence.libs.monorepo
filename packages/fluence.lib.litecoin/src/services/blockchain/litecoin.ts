
import { PluginManager, MultivestError } from '@applicature/synth.plugin-manager';
import { BlockchainService, Signature } from '@fluencesh/fluence.lib.services';
import * as bitcoin from 'bitcoinjs-lib';
import * as config from 'config';
import { LITECOIN, AvailableNetwork } from '../../constants';
import {
    LitecoinTransaction,
    LitecoinBlock
} from '../../types';
import { Errors } from '../../errors';
import { LitecoinTransportProvider, ManagedLitecoinTransport } from '../transports/interfaces';

export class LitecoinBlockchainService extends BlockchainService<
    LitecoinTransaction,
    LitecoinBlock,
    LitecoinTransportProvider,
    ManagedLitecoinTransport
> {
    constructor(pluginManager: PluginManager, blockchainTransport: ManagedLitecoinTransport) {
        super(pluginManager, blockchainTransport);
    }

    public getBlockchainId() {
        return LITECOIN;
    }

    public getSymbol() {
        return 'LTC';
    }

    public getServiceId() {
        return `litecoin.${ this.getNetworkId() }.blockchain.service`;
    }

    public isValidNetwork(network: string) {
        return AvailableNetwork.LITECOIN === network || AvailableNetwork.LITECOIN_TESTNET === network;
    }

    public async getHDAddress(index: number): Promise<string> {
        const masterPubKey = config.has('multivest.blockchain.bitcoin.hd.masterPublicKey')
            ? config.get<string>('multivest.blockchain.bitcoin.hd.masterPublicKey')
            : null;

        if (!masterPubKey) {
            throw new MultivestError(Errors.MASTER_PUBLIC_KEY_REQUIRED);
        }

        const network = this.getBitcoinCoreNetwork();

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

    public signTransaction(privateKey: Buffer, txData: LitecoinTransaction): string {
        const network = this.getBitcoinCoreNetwork();

        const key = bitcoin.ECPair.fromWIF(privateKey.toString('utf8'), network);
        
        const tx = new bitcoin.TransactionBuilder();
        tx.addInput(txData.hash, 0);
        tx.addOutput(txData.to[0].address, txData.to[0].amount.toNumber());
        tx.sign(0, key);

        return tx.build().toHex();
    }

    public signData(privateKey: Buffer, data: Buffer): Signature {
        const network = this.getBitcoinCoreNetwork();
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

    private getBitcoinCoreNetwork() {
        return this.getNetworkId() === AvailableNetwork.LITECOIN
            ? bitcoin.networks.litecoin
            : bitcoin.networks.testnet
    }
}
