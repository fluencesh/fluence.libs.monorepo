export const MetricRouterUrls = {
    GetMetrics: '/'
};

export const SwaggerRouterUrls = {
    GetSwaggerFile: '/'
};

export const PingRouterUrls = {
    Ping: '/'
};

export enum AbstractBlockchainRouteUrls {
    GetBlocks = '/blocks/',
    GetTransactionByHash = '/transactions/:hash/',
    SendTransaction = '/transactions/',
    GetBalanceOfAddress = '/addresses/:address/balance/'
}
