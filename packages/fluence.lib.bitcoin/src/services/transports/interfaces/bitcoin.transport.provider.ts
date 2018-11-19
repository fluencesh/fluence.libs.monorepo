import { BlockchainTransportProvider } from '@fluencesh/fluence.lib.services';
import { BitcoinTransaction, BitcoinBlock } from '../../../types';

export interface BitcoinTransportProvider extends BlockchainTransportProvider<BitcoinTransaction, BitcoinBlock> {}
