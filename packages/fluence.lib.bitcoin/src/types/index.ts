import { Scheme } from '@applicature-private/fluence.lib.services';

export interface BitcoinBlock extends Scheme.BlockchainBlock<BitcoinTransaction> {}

// tslint:disable-next-line:no-empty-interface
export interface BitcoinTransaction extends Scheme.BlockchainTransaction {}
