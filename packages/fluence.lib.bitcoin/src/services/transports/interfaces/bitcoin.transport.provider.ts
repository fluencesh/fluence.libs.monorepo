import { BlockchainTransportProvider } from '@applicature-private/fluence.lib.services';
import { BitcoinTransaction, BitcoinBlock } from '../../../types';

export interface BitcoinTransportProvider extends BlockchainTransportProvider<BitcoinTransaction, BitcoinBlock> {}
