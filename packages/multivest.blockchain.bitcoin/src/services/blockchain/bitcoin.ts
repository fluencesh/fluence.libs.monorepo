
import { PluginManager, Transaction } from '@applicature-private/multivest.core';
import { BlockchainService, Signature } from '@applicature-private/multivest.services.blockchain';
import * as bitcoin from 'bitcoinjs-lib';
import { BITCOIN } from '../../constants';
import { AvailableNetwork } from '../../types';
import { ManagedBitcoinTransportService } from '../transports/managed.bitcoin.transport.service';

export class BitcoinBlockchainService extends BlockchainService {
    protected blockchainTransport: ManagedBitcoinTransportService;

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

    public getHDAddress(index: number) {
        return this.blockchainTransport.getHDAddress(index);
    }

    public isValidAddress(address: string) {
        return this.blockchainTransport.isValidAddress(address);
    }

    public signTransaction(privateKey: Buffer, txData: Transaction): string {
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
