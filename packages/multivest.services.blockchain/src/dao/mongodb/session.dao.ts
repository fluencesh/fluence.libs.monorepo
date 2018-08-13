import { MongoDBDao } from '@fluencesh/multivest.mongodb';
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
            expiredAt: { $gt: new Date() }
        });
    }

    public async getByClientIdAndProjectId(clientId: string, projectId: string): Promise<Scheme.Session> {
        return this.getRaw({
            clientId,
            projectId,
        });
    }

    public async getByClientIdAndProjectIdActiveOnly(clientId: string, projectId: string): Promise<Scheme.Session> {
        return this.getRaw({
            clientId,
            projectId,
            expiredAt: { $gt: new Date() }
        });
    }

    public async listByClientId(clientId: string): Promise<Array<Scheme.Session>> {
        return this.listRaw({
            clientId
        });
    }

    public async listByClientIdActiveOnly(clientId: string): Promise<Array<Scheme.Session>> {
        return this.listRaw({
            clientId,
            expiredAt: { $gt: new Date() }
        });
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
