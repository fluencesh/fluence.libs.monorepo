declare module 'bitcoin-core' {
    export class Client {
        public agentOptions: any;
        public auth: { user: string; pass: string; };
        public hasNamedParametersSupport: boolean;
        public headers: any;
        public host: string;
        public password: string;
        public port: NetworkPorts | number;
        public timout: number;
        public ssl: SSL;

        constructor(options: ClientOptions);

        public getBlockCount(): Promise<number>;
        public getBlockHash(height: number): Promise<string>;
        public getBlockByHash(hash: string, options: { extension: Extension }): Promise<Block>;
        public getTransactionByHash(hash: string, options?: any): Promise<Transaction>;
        public sendToAddress(to: string, amount: string, comment?: string, commentTo?: string): Promise<string>;
        public sendRawTransaction(txHex: string): Promise<string>;
        public getBalance(address: string, minConf: number): Promise<number>;
    }

    export = Client;

    export type Extension = 'bin' | 'hex' | 'json';

    export interface ClientOptions {
        agentOptions: any;
        headers?: any;
        host?: string;
        logger?: any;
        network?: string;
        password?: string;
        port: NetworkPorts | number;
        ssl?: SSL | boolean;
        timeout?: number;
        username: number;
        version: string;
    }

    export interface Block {
        hash: string;
        confirmations: number;
        strippedsize: number;
        size: number;
        weight: number;
        height: number;
        version: number;
        versionHex: string;
        merkleroot: string;
        tx: string[];
        time: number;
        mediantime: number;
        nonce: number;
        bits: string;
        difficulty: number;
        chainwork: string;
        previousblockhash?: string;
        nextblockhash?: string;
    }

    export interface Transaction {
        amount : number;
        fee : number;
        confirmations : number;
        blockhash : string;
        blockindex : number;
        blocktime : number;
        txid : string;
        walletconflicts : any[];
        time : number;
        timereceived : number;
        'bip125-replaceable': 'yes' | 'no' | 'unknown';
        details : InputOutput[];
        hex : string;
    }

    export interface InputOutput {
        involvesWatchonly?: true;
        account: string;
        address: string;
        category: 'send' | 'receive';
        amount: number;
        vout: number;
        fee?: number;
    }

    export enum NetworkPorts {
        mainnet = 8332,
        regtest = 18332,
        testnet = 18332
    }

    export interface SSL {
        enabled: boolean;
        strict: boolean;
    }
}
