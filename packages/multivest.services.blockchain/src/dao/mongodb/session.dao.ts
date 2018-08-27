import { MongoDBDao } from '@applicature-private/multivest.mongodb';
import { DaoCollectionNames, DaoIds } from '../../constants';
import { Scheme } from '../../types';
import { SessionDao } from '../session.dao';

export class MongodbSessionDao extends MongoDBDao<Scheme.Session> implements SessionDao {
    public getDaoId() {
        return DaoIds.Session;
    }

    public getCollectionName() {
        return DaoCollectionNames.Session;
    }

    public getDefaultValue() {
        return {} as Scheme.Session;
    }

    public async createSession(
        expiredAt: Date,
        clientId: string,
        projectId: string = null
    ): Promise<Scheme.Session> {
        return this.create({
            clientId,
            projectId,
            
            expiredAt,
            createdAt: new Date(),
            loggedOutAt: null
        });
    }

    public async getById(sessionId: string): Promise<Scheme.Session> {
        return this.getRaw({ id: sessionId });
    }

    public async getByIdActiveOnly(sessionId: string): Promise<Scheme.Session> {
        return this.getRaw({
            id: sessionId,
            expiredAt: { $gt: new Date() },
            loggedOutAt: null
        });
    }

    public async getByClientId(clientId: string): Promise<Scheme.Session> {
        return this.getRaw({
            clientId,
        });
    }

    public async getByClientIdActiveOnly(clientId: string): Promise<Scheme.Session> {
        return this.getRaw({
            clientId,
            expiredAt: { $gt: new Date() },
            loggedOutAt: null
        });
    }

    public async setExpiredAt(sessionId: string, expiredAt: Date): Promise<void> {
        await this.updateRaw({ id: sessionId }, {
            $set: {
                expiredAt
            }
        });

        return;
    }

    public async logOut(sessionId: string): Promise<void> {
        await this.updateRaw({ id: sessionId }, {
            $set: {
                loggedOutAt: new Date()
            }
        });

        return;
    }
}
