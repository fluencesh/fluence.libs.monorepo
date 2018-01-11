declare module 'bitcoin-core' {
    import { Promise } from 'bluebird';

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
        public getBlockByHash(hash: string, options?: any): Promise<{}>;
        public getTransactionByHash(hash: string, options?: any): Promise<{}>;
        public sendTransaction(from: string, to: string, amount: number, fee: number): Promise<string>;
        public sendRawTransaction(txHex: string): Promise<string>;
        public getBalance(address: string, minConf: number): Promise<number>;
    }

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