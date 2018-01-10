declare module 'bitcoin-core' {
    export class Client {
        constructor(options: ClientOptions);
    }

    export interface ClientOptions {
        [key: string]: any;
    }
}