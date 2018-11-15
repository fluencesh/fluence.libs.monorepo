
import {
    EthereumTransaction,
    EthereumTransactionReceipt,
    EthereumBlock,
} from '../../../types';
import { ScBlockchainTransportProvider } from '@fluencesh/fluence.lib.services';

export interface EthereumTransportProvider extends ScBlockchainTransportProvider<EthereumTransaction, EthereumBlock> {
    getCode(address: string): Promise<string>;
    getTransactionReceipt(txHex: string): Promise<EthereumTransactionReceipt>;
    getAddressTransactionsCount(address: string, blockTag?: string | number): Promise<number>;
}
