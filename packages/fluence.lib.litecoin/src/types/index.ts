import { Scheme } from '@applicature-private/fluence.lib.services';

export interface LitecoinTransaction extends Scheme.BlockchainTransaction {}
export interface LitecoinBlock extends Scheme.BlockchainBlock<LitecoinTransaction> {}
