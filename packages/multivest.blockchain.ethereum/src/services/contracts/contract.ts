import * as EthereumAbi from 'ethereumjs-abi';
import * as EthereumUtil from 'ethereumjs-util';
import * as Web3 from 'web3';
import * as logger from 'winston';

import { MultivestError } from '@applicature/multivest.core';
import { EthereumBlockchainService } from '../blockchain/ethereum';

export class Contract {
    private ethereumService: EthereumBlockchainService;
    private contract: Web3.Contract<any>;

    constructor(
        abi: Array<Web3.AbiDefinition>,
        private address: string,
        private signerAddress: string
    ) {
        this.ethereumService = new EthereumBlockchainService();
        this.contract = this.ethereumService.getContract(abi, address);
    }

    public async generateData(methodId: string, types: any, values: any) {
        const hash = EthereumAbi.soliditySHA3(types, values);

        const sig = await this.ethereumService.sign(
            this.signerAddress,
            `0x${hash.toString('hex')}`
        );

        const res = EthereumUtil.fromRpcSig(sig);

        const prefix = Buffer.from('\x19Ethereum Signed Message:\n');
        const prefixedMsg = EthereumUtil.sha3(
            Buffer.concat([prefix, Buffer.from(String(hash.length)), hash])
        );

        const pubKey = EthereumUtil.ecrecover(prefixedMsg, res.v, res.r, res.s);
        const addrBuf = EthereumUtil.pubToAddress(pubKey);
        const recoveredAddress = EthereumUtil.bufferToHex(addrBuf);

        if (this.signerAddress !== recoveredAddress) {
            // @TODO: log it

            throw new MultivestError('internal error');
        }

        const methodArgTypes = [...types, 'uint8', 'bytes32', 'bytes32'];
        const methodArgValues = [...values, res.v, res.r, res.s];

        logger.info(
            'generateData arguments',
            methodArgValues.map((item) => {
                if (item instanceof Buffer) {
                    return item.toString('hex');
                }

                return item.valueOf();
            })
        );

        const data = EthereumAbi.simpleEncode(
            `${methodId}(${methodArgTypes.join(',')})`,
            ...methodArgValues
        );

        return data.toString('hex');
    }
}