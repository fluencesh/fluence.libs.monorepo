import { BigNumber } from 'bignumber.js';

declare module 'ethers' {
  class Contract {
    functions: {[ funName: string ]: (...params: Array<any>) => Promise<any> };

    estimate: {[ funName: string ]: (...params: Array<any>) => Promise<BigNumber> }

    constructor(address: string, abi: any, provider: providers.Provider);

    public static getDeployTransaction(bytecode: string, abi: string, ...params: Array<any>): any
  }

  namespace providers {
    export type Network = {
      chainId: number
      ensAddress: string
      name: string
    }

    export type Networks = {
      [index: string]: Network
    }

    class Provider {
      public constructor(network: Network | string)

      static fetchJSON(url: string, json: JSON, processFunc?: Function): Promise<any>
      static networks: Networks

      chainId: number
      ensAddress: string
      name: string

      waitForTransaction(transactionHash: string, timeout: number): Promise<Transaction>
      getBlockNumber(): Promise<number>
      getGasPrice(): Promise<utils.BigNumber>
      getBalance(addressOrENSName: string, blockTag: string): Promise<utils.BigNumber>
      getTransactionCount(addressOrENSName: string, blockTag: string): Promise<number>
      getCode(addressOrENSName: string, blockTag: string): Promise<string>
      getStorageAt(addressOrENSName: string, position: string, blockTag: string): Promise<string>
      sendTransaction(signedTransaction: string): Promise<string>
      call(transaction: Transaction): Promise<string>
      estimateGas(transaction: Transaction): Promise<utils.BigNumber>
      getBlock(blockHashOrBlockTag: string): Promise<any>
      getTransaction(transactionHash: string): Promise<Transaction>
      getTransactionReceipt(transactionHash: string): Promise<any>
      getLogs(filter: any): Promise<string[]>
      getEtherPrice(): Promise<number>
      resolveName(name: string): Promise<string>
      lookupAddress(address: string): Promise<string>
      on(eventName: string, listener: EventListener): void
      once(eventName: string, listener: EventListener): void
      emit(eventName: string): void
      listenerCount(eventName: string): number
      listeners(eventName: string): Promise<EventListener[]>
      removeAllListeners(eventName: string): void
      removeListener(eventName: string, listener: EventListener): void
      resetEventsBlock(blockNumber: number): void
      polling(value?: number): any
    }

    class EtherscanProvider extends Provider {
      public constructor(network: Network | string, apiKey: string)
      perform(method: string, params: string[]): Promise<string>
      getHistory(addressOrENSName: string, startBlock: number, endBlock: number): Promise<any[]>
    }

    class FallbackProvider extends Provider {
      public constructor(providers: Provider[])
      perform(method: string, params: string[]): Promise<string>
    }

    class JsonRpcProvider extends Provider {
      public constructor(url: string, network?: Network | string)
      send(method: string, params: string[]): Promise<string>
      perform(method: string, params: string[]): Promise<string>
    }

    class InfuraProvider extends JsonRpcProvider {
      public constructor(network: Network | string, apiAccessToken: string)
    }
    

  export type Transaction = {
      chainId: number
      hash: string
      from: string
      to: string
      data: any
      nounce: utils.BigNumber
      gasPrice: utils.BigNumber
      gasLimit: utils.BigNumber
      value: utils.BigNumber
    }

    namespace utils {
      type RLP = string

      const etherSymbol: string

      function arrayify(hex: string, name?: string): Uint8Array

      function concat(objects: any[]): Uint8Array
      function padZeros(value: any, length: number): Uint8Array
      function stripZeros(value: any): Uint8Array

      function bigNumberify(value: any): BigNumber

      function hexlify(value: any): string

      function toUtf8Bytes(text: string): Uint8Array
      function toUtf8String(bytes: Uint8Array): string

      function namehash(name: string, depth: number): string
      function id(text: string): string

      function getAddress(address: string, generateIcap?: boolean): string
      function getContractAddress(transaction: any): string

      function formatEther(wei: BigNumber, options: any): string
      function parseEther(ether: string): BigNumber

      function keccak256(value: any): string
      function sha256(value: any): string

      function randomBytes(length: number): Uint8Array

      function solidityPack(types: string[], values: any[]): string
      function solidityKeccak256(types: string[], values: any[]): string
      function soliditySha256(types: string[], values: any[]): string

      class BigNumber {
        public constructor(value: any)

        static constantNegativeOne: BigNumber
        static constantZero: BigNumber
        static constantOne: BigNumber
        static constantTwo: BigNumber
        static constantWeiPerEther: BigNumber

        fromTwos(value: any): BigNumber
        toTwos(value: any): BigNumber
        add(other: any): BigNumber
        sub(other: any): BigNumber
        div(other: any): BigNumber
        mul(other: any): BigNumber
        mod(other: any): BigNumber
        pow(other: any): BigNumber
        maskn(value: any): BigNumber
        eq(other: any): boolean
        lt(other: any): boolean
        lte(other: any): boolean
        gt(other: any): boolean
        gte(other: any): boolean
        isZero(): boolean
        toNumber(base?: number): number
        toString(): string
        toHexString(): string
      }

      namespace RLP {
        function encode(object: any): string
        function decode(data: any): any
      }
    }
  }
}
