import { Scheme } from '@applicature-private/multivest.services.blockchain';

export const TransportConnectionMock = {
    networkId: 'rinkeby',
    providerId: 'etherscan',
    settings: {
        url: 'etherscan'
    }
} as Scheme.TransportConnection;
