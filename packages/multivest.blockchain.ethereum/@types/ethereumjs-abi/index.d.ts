declare module 'ethereumjs-abi'{ 
  export function soliditySHA3(types: any, values: any): Buffer;
  export function simpleEncode(...args: Array<string>): Buffer;
  export function encode(abi: Array<any>, signature: string, data: Array<string>): Buffer;
  export function decode(abi: Array<any>, signature: string, data: string): Array<string | Buffer>;
  export function rawEncode(types: Array<string>, data: Array<string>): Buffer;
  export function rawDecode(types: Array<string>, data: string | Buffer): Array<string>;
}
