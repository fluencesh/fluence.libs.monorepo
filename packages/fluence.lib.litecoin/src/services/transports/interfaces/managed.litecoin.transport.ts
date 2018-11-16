import { ManagedBlockchainTransport } from '@applicature-private/fluence.lib.services';
import { LitecoinTransaction, LitecoinBlock } from '../../../types';
import { LitecoinTransportProvider } from './litecoin.transport.provider';

export interface ManagedLitecoinTransport
    extends ManagedBlockchainTransport<LitecoinTransaction, LitecoinBlock, LitecoinTransportProvider> {}
