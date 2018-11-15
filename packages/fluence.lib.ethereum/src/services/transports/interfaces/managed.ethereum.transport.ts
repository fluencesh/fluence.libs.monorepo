
import {
    EthereumTopic,
    EthereumTopicFilter,
    EthereumTransaction,
    EthereumTransactionReceipt,
    EthereumBlock,
} from '../../../types';
import { Scheme, ManagedScBlockchainTransport } from '@fluencesh/fluence.lib.services';
import BigNumber from 'bignumber.js';
import { EthereumTransportProvider } from './ethereum.transport.provider';

export interface ManagedEthereumTransport<
    Provider extends EthereumTransportProvider = EthereumTransportProvider
> extends ManagedScBlockchainTransport<
    EthereumTransaction,
    EthereumBlock,
    Provider
> {
    getCode(address: string, transportConnectionId: string): Promise<string>;
    getTransactionReceipt(txHex: string, transportConnectionId: string): Promise<EthereumTransactionReceipt>;
    getAddressTransactionsCount(
        address: string,
        transportConnectionId: string,
        blockTag?: string | number
    ): Promise<number>;
}
