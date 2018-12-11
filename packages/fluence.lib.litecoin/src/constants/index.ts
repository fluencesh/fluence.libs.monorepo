import { Network } from 'bitcoinjs-lib';

export const LITECOIN = 'LITECOIN';

export enum AvailableNetwork {
    LITECOIN = 'LITECOIN',
    LITECOIN_TESTNET = 'LITECOIN_TESTNET',
}

export const LitecoinTestNetNetwork: Network = {
    messagePrefix: '\x18Litecoin Signed Message:\n',
    bip32: {
        public: 70711009,
        private: 70709117
    },
    pubKeyHash: 0x6f,
    scriptHash: 0xc4,
    wif: 0xef,
};
