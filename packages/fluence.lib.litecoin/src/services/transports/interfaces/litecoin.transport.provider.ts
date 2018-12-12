import { BlockchainTransportProvider } from '@fluencesh/fluence.lib.services';
import { LitecoinBlock, LitecoinTransaction } from '../../../types';

export interface LitecoinTransportProvider extends BlockchainTransportProvider<LitecoinTransaction, LitecoinBlock> {}
