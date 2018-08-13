export enum DaoIds {
    AddressSubscription = 'address.subscriptions',
    Client = 'clients',
    Contract = 'contract',
    ContractPublicRequest = 'contract.public.requests',
    EthereumContractSubscription = 'ethereum.contract.subscription',
    EthereumEventLog = 'Ethereum.event.log',
    Job = 'job',
    Project = 'project',
    ProjectBlockchainSetup = 'project.blockchain.setup',
    Session = 'session',
    ScheduledTx = 'scheduled.tx',
    Transaction = 'transaction',
    TransactionHashSubscription = 'transaction.hash.subscription',
    TransportConnection = 'transport.connections',
    WebhookAction = 'webhook'
}

export enum DaoCollectionNames {
    AddressSubscription = 'addressSubscriptions',
    Client = 'clients',
    Contract = 'contracts',
    ContractPublicRequest = 'contractPublicRequests',
    EthereumContractSubscription = 'ethereumContractSubscriptions',
    EthereumEventLog = 'ethereumEventLogs',
    Job = 'jobs',
    Project = 'projects',
    ProjectBlockchainSetup = 'projectBlockchainSetups',
    Session = 'sessions',
    ScheduledTx = 'scheduledTxs',
    Transaction = 'transactions',
    TransactionHashSubscription = 'transactionHashSubscriptions',
    TransportConnection = 'transportConnections',
    WebhookAction = 'webhooks'
}

export const RandomStringPresets = {
    Hash256: { charset: '0123456789abcdef', length: 64 }
};

// tslint:disable-next-line:max-line-length
export const CronExpressionValidation = /^((\*|([1-9]|[1-6][0-9])\/([1-9]|[1-6][0-9])|((([1-9]|[1-6][0-9])\,){1,59}|)([1-9]|[1-6][0-9]))\ ){3}(\?|([1-9]|[1-3][0-9])\/([1-9]|[1-3][0-9])|(((([1-9]|[1-3][0-9])\,){1,30}|)([1-9]|[1-3][0-9]))|L|LW|L\-([1-9]|[1-3][0-9])|([1-9]|[1-3][0-9])W)\ (\*|(JAN|JAN\,|){1}(FEB|FEB\,|){1}(MAR|MAR\,|){1}(APR|APR\,|){1}(MAY|MAY\,|){1}(JUN|JUN\,|){1}(JUL|JUL\,|){1}(AUG|AUG\,|){1}(SEP|SEP\,|){1}(OCT|OCT\,|){1}(NOV|NOV\,|){1}(DEC|){1}|([1-9]|1[0-2])(\-|\/)([1-9]|1[0-2]))\ (\*|\?|[1-7]\/[1-7]|(SUN|SUN\,|){1}(MON|MON\,|){1}(TUE|TUE\,|){1}(WED|WED\,|){1}(THU|THU\,|){1}(FRI|FRI\,|){1}(SAT|SAT\,|){1}|[1-7]L|[1-7]\#[1-5])\ (\*|20[1-9][1-9]\/([1-9]|[1-8][0-9])|((20[1-9][1-9]\,){1,82}|)(20[1-9][1-9])|(20[1-9][1-9])\-(20[1-9][1-9]))$/;
