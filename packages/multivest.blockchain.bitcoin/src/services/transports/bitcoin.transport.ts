import { BlockchainTransport } from '@applicature-private/multivest.services.blockchain';

export interface BitcoinTransport extends BlockchainTransport {
    getHDAddress(index: number): Promise<string>;
    isValidAddress(address: string): boolean;
}
