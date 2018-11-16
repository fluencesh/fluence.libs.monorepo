export const STD_VALUE_MULTIPLIER = 100000000;

export const BITCOIN = 'BITCOIN';

export const BitcoinCoreTransportConfigScheme = {
    type: 'object',

    additionalProperties: true,
    properties: {
        networkId: { type: 'string' },
        settings: {
            type: 'object',

            additionalProperties: true,
            properties: {
                host: { type: 'string' },
                network: { type: 'string' },
                password: { type: 'string' },
                username: { type: 'string' },
            },
            required: [ 'host', 'network', 'password', 'username' ]
        },
    },
    required: [ 'networkId', 'settings' ]
};

export const BitcoinInfoTransportConfigScheme = {
    type: 'object',

    additionalProperties: true,
    properties: {
        networkId: { type: 'string' },
        settings: {
            type: 'object',

            additionalProperties: true,
            properties: {
                apiKey: { type: 'string' },
                url: { type: 'string' },
                wallet: {
                    type: 'object',

                    additionalProperties: true,
                    properties: {
                        id: { type: 'string' }
                    },
                    required: ['id']
                },
            },
            required: [ 'url' ]
        },
    },
    required: [ 'networkId', 'settings' ]
};
