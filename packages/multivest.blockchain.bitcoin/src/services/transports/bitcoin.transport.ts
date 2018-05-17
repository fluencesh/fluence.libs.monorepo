import { BlockchainTransport, Scheme } from '@applicature-restricted/multivest.services.blockchain';
import { Block, Transaction } from '@applicature/multivest.core';

export interface BitcoinTransport extends BlockchainTransport {
    getHDAddress(index: number): Promise<string>;
    isValidAddress(address: string): boolean;
}
