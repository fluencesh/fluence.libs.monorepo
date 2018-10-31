export interface EthereumContractAbiItem {
    anonymous?: boolean;
    constant?: boolean;
    inputs: Array<EthereumContractAbiItemNameType>;
    name: string;
    outputs?: Array<EthereumContractAbiItemNameType>;
    type: string;
}

export interface EthereumContractAbiItemNameType {
    name: string;
    type: string;
    indexed: boolean;
}

export interface EthereumContractAbiItemTemplate {
    name: string;
    inputTypes: string;
    methodParamsSignature: string;
}

export interface SdkJsData {
    jsText: string;
    mapText: string;
}

export interface SdkData extends SdkJsData {
    declarationText: string;
    tsText: string;
}
