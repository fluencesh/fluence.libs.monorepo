import { Signature } from '@applicature-restricted/multivest.blockchain';
import {
    BlockchainService,
    BlockchainTransportService,
    ManagedBlockchainTransportService,
    Scheme
} from '@applicature-restricted/multivest.services.blockchain';
import { MultivestError, PluginManager } from '@applicature/multivest.core';
import { BigNumber } from 'bignumber.js';
import * as config from 'config';
import * as EthereumTx from 'ethereumjs-tx';
import * as EthereumUtil from 'ethereumjs-util';
import { EthereumTransportService } from '../transports/ethereum.transport';
import { EthersEthereumTransportService, Provider } from '../transports/ethers.ethereum.transport';
import { ETHEREUM, ethereumNetworkToChainId, EthereumTransaction, ethereumValidNetworks } from '../types/types';
import { ManagedEthereumTransportService } from './managed.ethereum.transport.service';

export class EthereumBlockchainService extends BlockchainService {
    private apiToken: string;
    private connections: Array<Scheme.TransportConnection>;

    constructor(
        pluginManager: PluginManager,
        connections: Array<Scheme.TransportConnection>,
        transportService: EthereumTransportService
    ) {
        const connection = connections.find((con) => !!con.networkId);

        if (!connection) {
            throw new MultivestError('param `connections` should contain at least one obj with filled network id');
        }

        super(pluginManager, connection.networkId, transportService);

        this.pluginManager = pluginManager;
        this.connections = connections;
    }

    public async init() {
        const transports: Array<EthereumTransportService> =
            this.connections.map((con) => new EthersEthereumTransportService(con));

        this.blockChainTransportService = new ManagedEthereumTransportService(this.pluginManager, transports);
    }

    public getServiceId() {
        return 'ethereum.blockchain.service';
    }

    public isValidNetwork(network: string) {
        return ethereumValidNetworks.indexOf(network) > -1;
    }

    public getBlockchainId() {
        return ETHEREUM;
    }

    public getSymbol() {
        return 'ETH';
    }

    public getHDAddress(index: number): string {
        throw new MultivestError('not implemented');
    }

    public isValidAddress(address: string): boolean {
        return EthereumUtil.isValidAddress(address);
    }

    public signData(privateKey: Buffer, data: Buffer): Signature {
        const signerAddress = (EthereumUtil.privateToAddress(privateKey) as Buffer).toString('hex');

        const prefix = Buffer.from('\x19Ethereum Signed Message:\n');
        const prefixedMsg = EthereumUtil.sha3(Buffer.concat([prefix, Buffer.from(String(data.length)), data]));

        const res = EthereumUtil.ecsign(prefixedMsg, privateKey);

        const pubKey = EthereumUtil.ecrecover(prefixedMsg, res.v, res.r, res.s);
        const addrBuf = EthereumUtil.pubToAddress(pubKey, false) as Buffer;

        const recoveredAddress = addrBuf.toString('hex');

        if (signerAddress !== recoveredAddress) {
            // @TODO: log it

            throw new MultivestError('internal error');
        }

        return {
            v: res.v,
            r: res.r,
            s: res.s
        };
    }

    public signDataAndStringify(privateKey: Buffer, data: Buffer): string {
        const signature = this.signData(privateKey, data);

        const stringifiedSignature = EthereumUtil.toRpcSig(signature.v, signature.r, signature.s);

        return stringifiedSignature;
    }

    public signTransaction(privateKey: Buffer, txData: EthereumTransaction): string {
        const txParams = {
            nonce: `0x${txData.nonce.toString(16)}`,
            gasPrice: `0x${new BigNumber(txData.gasPrice).toString(16)}`,
            gasLimit: `0x${new BigNumber(txData.gas).toString(16)}`,

            to: txData.to[0].address.toLowerCase(),
            value: `0x${txData.to[0].amount.toString(16)}`,

            data: txData.input,

            chainId: ethereumNetworkToChainId[this.network]
        };

        const tx = new EthereumTx(txParams);

        tx.sign(privateKey);

        const serializedTx = tx.serialize();

        return serializedTx.toString('hex');
    }
}
