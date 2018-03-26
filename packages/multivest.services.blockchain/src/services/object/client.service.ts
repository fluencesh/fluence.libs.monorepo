import { PluginManager, Service } from '@applicature/multivest.core';
import { ClientDao } from '../../dao/client.dao';
import { Scheme } from '../../types';

    export class ClientService extends Service {
    protected clientDao: ClientDao;

    constructor(pluginManager: PluginManager) {
        super(pluginManager);

        // @TODO: set ClientDao
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

    public setStatus(clientId: string, status: Scheme.ClientStatus): Promise<void> {
        return this.clientDao.setStatus(clientId, status);
    }
}
