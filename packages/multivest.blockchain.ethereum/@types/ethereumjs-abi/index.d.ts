declare module 'ethereumjs-abi'{ 
  export function soliditySHA3(types: any, values: any): Buffer; 
  export function simpleEncode(...args: Array<string>): Buffer; 
}
