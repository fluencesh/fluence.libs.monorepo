import { BlockchainTransportProvider } from '@applicature-private/fluence.lib.services';
import { LitecoinBlock, LitecoinTransaction } from '../../../types';

export interface LitecoinTransportProvider extends BlockchainTransportProvider<LitecoinTransaction, LitecoinBlock> {}
