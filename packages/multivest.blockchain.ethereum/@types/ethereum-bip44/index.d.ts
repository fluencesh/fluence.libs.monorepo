declare module 'ethereum-bip44' {
    export default class EthereumBIP44 {
        public static fromPublicSeed(seed: Object | string | Buffer): EthereumBIP44;
        public getAddress(index: number): string;
    }
}