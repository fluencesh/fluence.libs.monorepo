import { PluginManager, Service } from '@applicature/multivest.core';
import { Plugin } from '@applicature/multivest.mongodb';
import { ClientDao } from '../../dao/client.dao';
import { Scheme } from '../../types';
import { AddressSubscriptionService } from './address.subscription.service';
import { EthereumContractSubscriptionService } from './ethereum.contract.subscription.service';
import { TransactionHashSubscriptionService } from './transaction.hash.subscription.service';

export class ClientService extends Service {
    protected clientDao: ClientDao;
    protected addressSubscriptionService: AddressSubscriptionService;
    protected transactionHashSubscriptionService: TransactionHashSubscriptionService;
    protected contractSubscriptionService: EthereumContractSubscriptionService;

    constructor(pluginManager: PluginManager) {
        super(pluginManager);
    }

    public async init(): Promise<void> {
        const mongodbPlugin = this.pluginManager.get('mongodb') as Plugin;

        this.clientDao = await mongodbPlugin.getDao('clients') as ClientDao;

        this.addressSubscriptionService = this.pluginManager
            .getServiceByClass(AddressSubscriptionService) as AddressSubscriptionService;
        this.transactionHashSubscriptionService = this.pluginManager
            .getServiceByClass(TransactionHashSubscriptionService) as TransactionHashSubscriptionService;
        this.contractSubscriptionService = this.pluginManager
            .getServiceByClass(EthereumContractSubscriptionService) as EthereumContractSubscriptionService;
    }

    public getServiceId(): string {
        return 'object.clients';
    }

    public async createClient(ethereumAddress: string, status: Scheme.ClientStatus): Promise<Scheme.Client> {
        return this.clientDao.createClient(ethereumAddress, status);
    }

    public async getById(clientId: string): Promise<Scheme.Client> {
        return this.clientDao.getById(clientId);
    }

    public getByEthereumAddress(ethereumAddress: string): Promise<Scheme.Client> {
        return this.clientDao.getByEthereumAddress(ethereumAddress);
    }

    public async setStatus(clientId: string, status: Scheme.ClientStatus): Promise<void> {
        const isActive = status === Scheme.ClientStatus.Active;
        await Promise.all([
            this.clientDao.setStatus(clientId, status),
            this.modifySubscriptionStatus(clientId, isActive)
        ]);

        return;
    }

    private async modifySubscriptionStatus(clientId: string, isActive: boolean): Promise<any> {
        return Promise.all([
            this.addressSubscriptionService.setClientActive(clientId, isActive),
            this.transactionHashSubscriptionService.setClientActive(clientId, isActive),
            this.contractSubscriptionService.setClientActive(clientId, isActive)
        ]);
    }
}
