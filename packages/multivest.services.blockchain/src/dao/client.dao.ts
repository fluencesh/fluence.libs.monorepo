import { Dao } from '@applicature-private/multivest.core';
import { Scheme } from '../types';

export abstract class ClientDao extends Dao<Scheme.Client> {
    public abstract async createClient(
        email: string,
        passwordHash: string,
        isAdmin: boolean
    ): Promise<Scheme.Client>;

    public abstract async getById(clientId: string): Promise<Scheme.Client>;
    public abstract async getByEmail(email: string): Promise<Scheme.Client>;
    public abstract async getByEmailAndPasswordHash(email: string, passwordHash: string): Promise<Scheme.Client>;

    public abstract async setStatus(clientId: string, status: Scheme.ClientStatus): Promise<void>;
    public abstract async setVerificationStatus(clientId: string, isVerified: boolean): Promise<void>;

    public abstract async removeById(clientId: string): Promise<void>;
}
