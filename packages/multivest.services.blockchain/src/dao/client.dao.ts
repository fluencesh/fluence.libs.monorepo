import { Dao } from '@applicature/multivest.core';
import { Scheme } from '../types';

export abstract class ClientDao extends Dao<Scheme.Client> {
    public abstract async createClient(ethereumAddress: string, status: Scheme.ClientStatus): Promise<Scheme.Client>;

    public abstract async getById(clientId: string): Promise<Scheme.Client>;

    public abstract async getByEthereumAddress(ethereumAddress: string): Promise<Scheme.Client>;

    public abstract async setStatus(clientId: string, status: Scheme.ClientStatus): Promise<void>;
}
