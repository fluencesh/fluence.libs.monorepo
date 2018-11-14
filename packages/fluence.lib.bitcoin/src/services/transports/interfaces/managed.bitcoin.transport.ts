import { ManagedBlockchainTransport } from '@applicature-private/fluence.lib.services';
import { BitcoinTransaction, BitcoinBlock } from '../../../types';
import { BitcoinTransportProvider } from './bitcoin.transport.provider';

export interface ManagedBitcoinTransport
    extends ManagedBlockchainTransport<BitcoinTransaction, BitcoinBlock, BitcoinTransportProvider> {}
