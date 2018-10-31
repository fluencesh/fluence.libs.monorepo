export enum AbstractBlockchainRouteUrls {
    GetBlocks = '/blocks/',
    GetTransactionByHash = '/transactions/:hash/',
    SendTransaction = '/transactions/',
    GetBalanceOfAddress = '/addresses/:address/balance/',
    CallTroughJsonRpc = '/json-rpc/',
}
