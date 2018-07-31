export const MetricRouterUrls = {
    GetMetrics: '/metrics/'
};

export const SwaggerRouterUrls = {
    GetSwaggerFile: '/swagger/'
};

export const PingRouterUrls = {
    Ping: '/ping/'
};

export enum AbstractBlockchainRouteUrls {
    GetBlocks = '/blocks/',
    GetTransactionByHash = '/transactions/:hash/',
    SendTransaction = '/transactions/',
    GetBalanceOfAddress = '/addresses/:address/balance/'
}
