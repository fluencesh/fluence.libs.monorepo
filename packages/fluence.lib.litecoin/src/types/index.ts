import { Scheme } from '@fluencesh/fluence.lib.services';

// tslint:disable-next-line:no-empty-interface
export interface LitecoinTransaction extends Scheme.BlockchainTransaction {}
export interface LitecoinBlock extends Scheme.BlockchainBlock<LitecoinTransaction> {}
