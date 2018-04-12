declare module 'ethereumjs-tx' { 
 
  class EthereumTx { 
      constructor(params: any); 
      public sign(privateKey: Buffer): void; 
      public serialize(): Buffer; 
      public hash(): Buffer; 
  } 

  namespace EthereumTx {} 

  export = EthereumTx; 
}