import { Scheme } from '@applicature-restricted/multivest.services.blockchain';

export const TransportConnectionMock = {
    networkId: 'rinkeby',
    providerId: 'etherscan',
    settings: {
        url: 'etherscan'
    }
} as Scheme.TransportConnection;
