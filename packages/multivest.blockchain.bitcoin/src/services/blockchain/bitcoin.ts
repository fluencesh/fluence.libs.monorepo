
import { BlockchainService, Signature } from '@applicature-restricted/multivest.services.blockchain';
import { Block, MultivestError, PluginManager, Recipient, Sender, Transaction } from '@applicature/multivest.core';
import * as bitcoin from 'bitcoinjs-lib';
import * as config from 'config';
import { BITCOIN } from '../../constants';
import { Errors } from '../../errors';
import { AvailableNetwork } from '../../types';
import { BitcoinTransport } from '../transports/bitcoin.transport';

export class BitcoinBlockchainService extends BlockchainService {
    protected blockchainTransport: BitcoinTransport;

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
