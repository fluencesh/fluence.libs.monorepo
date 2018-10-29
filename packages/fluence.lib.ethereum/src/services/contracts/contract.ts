import { Signature } from '@applicature-private/fluence.lib.services';
import * as EthereumAbi from 'ethereumjs-abi';
import { EthereumBlockchainService } from '../blockchain/ethereum';

// THINK: Is this class still useful?
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
    /*
        params: {
            [contractAddress]: {
                // contract public methods
                'balanceOf': [{_owner: '0x0'}, {_owner: '0x1'}, {_owner: '0x2'}],
                'allowance': [{_owner: '0x', _spender: '0x'}],

                // contract public variables
                'decimals': true,
                name: true,
                totalSupply: true
            }
        }

        Response:
        address => {
           balanceOf: [{args: [{_owner: '0x'}], response: [{balance: '0x'}]}, {args: [{_owner: '0x1'}], response: [{balance: '0x2'}]}],
           decimals: [{response: [{decimals: '18'}]}],
        }
     */

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
    //         for(let arg of Object.keys(args)) {
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
