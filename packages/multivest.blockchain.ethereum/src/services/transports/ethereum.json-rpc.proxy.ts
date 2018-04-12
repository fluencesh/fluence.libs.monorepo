import {Hashtable} from '@applicature/multivest.core';

import {
    JsonRpcProxy
} from '@applicature-restricted/multivest.blockchain/dist/src/services/json-rpc.proxy';
import {AxiosRequestConfig} from 'axios';

export class EthereumJsonRpcProxy extends JsonRpcProxy {
    constructor(url: string) {
        super(url);
    }

    public getValidationScheme(): Hashtable<object> {
        // @TODO: define abi

        return {
            'web3_sha3': {},
            'eth_protocolVersion': {},
            'eth_syncing': {},
            'eth_gasPrice': {},
            'eth_blockNumber': {},
            'eth_getBalance': {},
            'eth_getStorageAt': {},
            'eth_getTransactionCount': {},
            'eth_getBlockTransactionCountByHash': {},
            'eth_getBlockTransactionCountByNumber': {},
            'eth_getUncleCountByBlockHash': {},
            'eth_getUncleCountByBlockNumber': {},
            'eth_getCode': {},
            'eth_sendRawTransaction': {},
            'eth_call': {},
            'eth_estimateGas': {},
            'eth_getBlockByHash': {},
            'eth_getBlockByNumber': {},
            'eth_getTransactionByHash': {},
            'eth_getTransactionByBlockHashAndIndex': {},
            'eth_getTransactionByBlockNumberAndIndex': {},
            'eth_getTransactionReceipt': {},
            'eth_getUncleByBlockHashAndIndex': {},
            'eth_getUncleByBlockNumberAndIndex': {},
            // eth_newFilter
            // eth_newBlockFilter
            // eth_newPendingTransactionFilter
            // eth_uninstallFilter
            // eth_getFilterChanges
            // eth_getFilterLogs
            'eth_getLogs': {}
        };
    }

    protected populateRequestOptions(options: AxiosRequestConfig): AxiosRequestConfig {
        return options;
    }
}
