import { Scheme } from '@fluencesh/multivest.services.blockchain';

export const TransportConnectionMock = {
    networkId: 'rinkeby',
    providerId: 'etherscan',
    settings: {
        url: 'etherscan'
    }
} as Scheme.TransportConnection;
