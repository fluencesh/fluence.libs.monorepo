import {Signature} from '@applicature-restricted/multivest.blockchain';
import { MultivestError } from '@applicature/multivest.core';
import { Hashtable } from '@applicature/multivest.core/';
import * as EthereumAbi from 'ethereumjs-abi';
import { EthereumBlockchainService } from '../blockchain/ethereum';
import {EthereumContract} from '../types/types';

export class Contract {
    protected ethereumBlockchainService: EthereumBlockchainService;
    protected abi: any;

    constructor(ethereumBlockchainService: EthereumBlockchainService, abi: any) {
        this.ethereumBlockchainService = ethereumBlockchainService;
        this.abi = abi;
    }

    protected async generateData(methodId: string, types: any, values: any) {
        const data = EthereumAbi.simpleEncode(`${methodId}(${types.join(',')})`, ...values);

        return data.toString('hex');
    }

    protected async generateSignedData(privateKey: Buffer, methodId: string, types: any, values: any) {
        const hash = EthereumAbi.soliditySHA3(types, values);

        const signature: Signature = this.ethereumBlockchainService.signData(privateKey, hash);

        const methodArgTypes = [...types, 'uint8', 'bytes32', 'bytes32'];
        const methodArgValues = [...values, signature.v, signature.r, signature.s];

        return this.generateData(methodId, methodArgTypes, methodArgValues);
    }

    /* tslint:disable */
    // public async getSate(contracts: Hashtable<EthereumContract>, params: Hashtable<object>) {
    //     // @TODO: define contracts structure
    //
    //     const response = {};
    //
    //     for (const contractAddress in params) {
    //         if (! contracts.hasOwnProperty(contractAddress)) {
    //             throw new MultivestError('unknown contract address');
    //         }
    //
    //         let contract = contracts[contractAddress];
    //
    //         for (let stateId in params[contractAddress]) {
    //             // @TODO: check that stateId exists
    //
    //             response[contractAddress][stateId] = await this.getStateMethod(
    //                 contract,
    //                 stateId,
    //                 params[contractAddress][stateId]
    //             );
    //         }
    //     }
    // }
    //
    // public async getStateMethod(contracts: EthereumContract, stateId: string, args: any) {
    //     if(Array.isArray(args)) {
    //         for(let item of args) {
    //             await this.getSate(contract, contractId, stateId, item);
    //         }
    //     }
    //     else if(typeof args == "object" && args.constructor.name != "BigNumber") {
    //         const keys = Object.keys(args);
    //
    //         if(keys.length == 1) {
    //             const val = (await contract[stateId].call(keys[0])).valueOf();
    //
    //             assert.equal(val, args[keys[0]],
    //                 `Contract ${contractId} state ${stateId} with arg ${keys[0]} & value ${val} is not equal to ${args[keys[0]]}`);
    //
    //             return;
    //         }
    //
    //         const passArgs = [];
    //
    //         if(! args.hasOwnProperty("__val")) {
    //             assert.fail(new Error("__val is not present"));
    //         }
    //
    //         for(let arg of Object.keys(args)) {
    //             if(arg == "__val") {
    //                 continue;
    //             }
    //
    //             passArgs.push(args[arg]);
    //         }
    //
    //         const val = (await contract[stateId].call( ...passArgs )).valueOf();
    //
    //         assert.equal(val, args["__val"], `Contract ${contractId} state ${stateId} with value ${val} is not equal to ${args['__val']}`);
    //     }
    //     else {
    //         const val = (await contract[stateId].call()).valueOf();
    //
    //         assert.equal(val, args, `Contract ${contractId} state ${stateId} with value ${val} is not equal to ${args.valueOf()}`);
    //     }
    // }
}
