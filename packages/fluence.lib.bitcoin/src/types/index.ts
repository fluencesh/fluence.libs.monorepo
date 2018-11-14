import { Scheme } from '@applicature-private/fluence.lib.services';

export enum AvailableNetwork {
    MAIN_NET = 'MAIN_NET',
    TEST_NET = 'TEST_NET'
}

export interface BitcoinTransaction extends Scheme.BlockchainTransaction {}
export interface BitcoinBlock extends Scheme.BlockchainBlock<BitcoinTransaction> {}
