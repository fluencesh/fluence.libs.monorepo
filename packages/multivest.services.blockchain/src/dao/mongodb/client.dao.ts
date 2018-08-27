import { MongoDBDao } from '@applicature-private/multivest.mongodb';
import { DaoCollectionNames, DaoIds } from '../../constants';
import { Scheme } from '../../types';
import {ClientDao} from '../client.dao';

export class MongodbClientDao extends MongoDBDao<Scheme.Client> implements ClientDao {
    public getDaoId() {
        return DaoIds.Client;
    }

    public getCollectionName() {
        return DaoCollectionNames.Client;
    }

    public getDefaultValue() {
        return {} as Scheme.Client;
    }

    public async getById(clientId: string): Promise<Scheme.Client> {
        return this.getRaw({ id: clientId });
    }

    public async getByEmail(email: string): Promise<Scheme.Client> {
        return this.getRaw({ email });
    }

    public async getByEmailAndPasswordHash(email: string, passwordHash: string): Promise<Scheme.Client> {
        return this.getRaw({
            email,
            passwordHash
        });
    }

    public async createClient(
        email: string,
        passwordHash: string,
        isAdmin: boolean
    ): Promise<Scheme.Client> {
        return this.create({
            email,
            passwordHash,
            isAdmin,
            status: Scheme.ClientStatus.Active,
            createdAt: new Date()
        });
    }

    public async setStatus(id: string, status: Scheme.ClientStatus): Promise<void> {
        await this.updateRaw({ id }, {
            $set: {
                status
            }
        });

        return;
    }

    public async setVerificationStatus(clientId: string, isVerified: boolean): Promise<void> {
        await this.updateRaw({ id: clientId }, {
            $set: {
                isVerified
            }
        });

        return;
    }
}
