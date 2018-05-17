
declare module 'bitcoin-core' {
    import { Promise } from 'bluebird';

    class Client {
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
        public getBlockByHash(hash: string, options: { extension: 'hex' | 'json' }): Promise<any>;
        public getTransactionByHash(hash: string, options?: any): Promise<any>;
        public sendToAddress(to: string, amount: string, comment?: string, commentTo?: string): Promise<string>;
        public sendRawTransaction(txHex: string): Promise<string>;
        public getBalance(address: string, minConf: number): Promise<number>;
    }

    export = Client;

    interface ClientOptions {
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

    interface Block {
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

    interface Transaction {
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

    interface InputOutput {
        involvesWatchonly?: true;
        account: string;
        address: string;
        category: 'send' | 'receive';
        amount: number;
        vout: number;
        fee?: number;
    }

    enum NetworkPorts {
        mainnet = 8332,
        regtest = 18332,
        testnet = 18332
    }

    interface SSL {
        enabled: boolean;
        strict: boolean;
    }
}
