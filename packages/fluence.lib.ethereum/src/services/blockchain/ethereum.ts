import { MultivestError } from '@applicature/core.plugin-manager';
import {
    BlockchainService,
    Scheme,
    Signature
} from '@fluencesh/fluence.lib.services';
import { BigNumber } from 'bignumber.js';
import * as EthereumTx from 'ethereumjs-tx';
import * as EthereumUtil from 'ethereumjs-util';
import { ServiceIds } from '../../constants';
import {
    ETHEREUM,
    ethereumNetworkToChainId,
    EthereumTopic,
    EthereumTopicFilter,
    EthereumTransaction,
    EthereumTransactionReceipt,
    ethereumValidNetworks,
} from '../../types';
import { ManagedEthereumTransportService } from '../transports/managed.ethereum.transport.service';

export class EthereumBlockchainService extends BlockchainService<EthereumTransaction> {
    protected blockchainTransport: ManagedEthereumTransportService;

    public getServiceId(): string {
        return ServiceIds.EthereumBlockchainService;
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

    public async getHDAddress(index: number, transportId?: string): Promise<string> {
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
            gasPrice: `0x${txData.gasPrice.toString(16)}`,
            gasLimit: `0x${txData.gasLimit.toString(16)}`,

            to: txData.to[0].address.toLowerCase(),
            value: `0x${txData.to[0].amount.toString(16)}`,

            data: txData.input,

            chainId: ethereumNetworkToChainId[this.getNetworkId()]
        };

        const tx = new EthereumTx(txParams);

        tx.sign(privateKey);

        const serializedTx = tx.serialize();

        return serializedTx.toString('hex');
    }

    public getGasPrice(transportId?: string): Promise<BigNumber> {
        return this.blockchainTransport.getGasPrice(transportId);
    }

    public getCode(address: string, transportId?: string) {
        return this.blockchainTransport.getCode(address, transportId);
    }

    public getLogs(filters: EthereumTopicFilter, transportId?: string): Promise<Array<EthereumTopic>> {
        return this.blockchainTransport.getLogs(filters, transportId);
    }

    public getTransactionReceipt(txHex: string, transportId?: string): Promise<EthereumTransactionReceipt> {
        return this.blockchainTransport.getTransactionReceipt(txHex, transportId);
    }

    public call(tx: EthereumTransaction, transportId?: string) {
        return this.blockchainTransport.call(tx, transportId);
    }

    public callContractMethod(
        contractEntity: Scheme.ContractScheme,
        methodName: string,
        inputTypes: Array<string> = [],
        inputValues: Array<string> = [],
        transportId?: string
    ) {
        return this.blockchainTransport.callContractMethod(
            contractEntity,
            methodName,
            inputTypes,
            inputValues,
            transportId
        );
    }

    public contractMethodGasEstimate(
        contractEntity: Scheme.ContractScheme,
        methodName: string,
        inputTypes: Array<string> = [],
        inputValues: Array<string> = [],
        transportId?: string
    ) {
        return this.blockchainTransport.contractMethodGasEstimate(
            contractEntity,
            methodName,
            inputTypes,
            inputValues,
            transportId
        );
    }

    public estimateGas(tx: EthereumTransaction, transportId?: string) {
        return this.blockchainTransport.estimateGas(tx, transportId);
    }

    public getAddressTransactionsCount(
        address: string,
        blockTag?: number | string,
        transportId?: string
    ): Promise<number> {
        return this.blockchainTransport.getAddressTransactionsCount(address, blockTag, transportId);
    }
}
