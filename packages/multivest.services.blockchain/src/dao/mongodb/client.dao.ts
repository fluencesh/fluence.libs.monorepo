import { MongoDBDao } from '@applicature/multivest.mongodb';
import { Scheme } from '../../types';
import {ClientDao} from '../client.dao';

export class MongodbClientDao extends MongoDBDao<Scheme.Client> implements ClientDao {
    public getDaoId() {
        return 'clients';
    }

    public getCollectionName() {
        return 'clients';
    }

    public getDefaultValue() {
        return {} as Scheme.Client;
    }

    public async getById(clientId: string): Promise<Scheme.Client> {
        return this.get({ id: clientId });
    }

    public async getByEthereumAddress(ethereumAddress: string): Promise<Scheme.Client> {
        return this.get({ ethereumAddress });
    }

    public async createClient(ethereumAddress: string, status: Scheme.ClientStatus): Promise<Scheme.Client> {
        return this.create({
            ethereumAddress,
            status,
            createdAt: new Date()
        });
    }

    public async setStatus(id: string, status: Scheme.ClientStatus): Promise<void> {
        await this.updateRaw(
            {
                id
            },
            {
                $set: {
                    status
                }
            }
        );

        return;
    }
}
