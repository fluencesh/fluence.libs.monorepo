import { Scheme } from '@fluencesh/fluence.lib.services';

export interface LitecoinTransaction extends Scheme.BlockchainTransaction {}
export interface LitecoinBlock extends Scheme.BlockchainBlock<LitecoinTransaction> {}
