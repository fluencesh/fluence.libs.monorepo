import {
    BlockchainService,
    Scheme,
    Signature
} from '@applicature-restricted/multivest.services.blockchain';
import { MultivestError } from '@applicature/multivest.core';
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
import { EthereumTransport } from '../transports/ethereum.transport';

export class EthereumBlockchainService extends BlockchainService {
    protected blockchainTransport: EthereumTransport;

    public getServiceId() {
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

    public async getHDAddress(index: number): Promise<string> {
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

    public getGasPrice(): Promise<BigNumber> {
        return this.blockchainTransport.getGasPrice();
    }

    public getCode(address: string) {
        return this.blockchainTransport.getCode(address);
    }

    public getLogs(filters: EthereumTopicFilter): Promise<Array<EthereumTopic>> {
        return this.blockchainTransport.getLogs(filters);
    }

    public getTransactionReceipt(txHex: string): Promise<EthereumTransactionReceipt> {
        return this.blockchainTransport.getTransactionReceipt(txHex);
    }

    public call(tx: EthereumTransaction) {
        return this.blockchainTransport.call(tx);
    }

    public callContractMethod(
        contractEntity: Scheme.ContractScheme,
        methodName: string,
        inputTypes: Array<string> = [],
        inputValues: Array<string> = []
    ) {
        return this.blockchainTransport.callContractMethod(contractEntity, methodName, inputTypes, inputValues);
    }

    public contractMethodGasEstimate(
        contractEntity: Scheme.ContractScheme,
        methodName: string,
        inputTypes: Array<string> = [],
        inputValues: Array<string> = []
    ) {
        return this.blockchainTransport.contractMethodGasEstimate(contractEntity, methodName, inputTypes, inputValues);
    }

    public estimateGas(tx: EthereumTransaction) {
        return this.blockchainTransport.estimateGas(tx);
    }

    public getAddressTransactionsCount(address: string, blockTag?: number | string): Promise<number> {
        return this.blockchainTransport.getAddressTransactionsCount(address, blockTag);
    }
}
