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

    public async createUserSession(
        clientId: string,
        expiredAt: Date
    ): Promise<Scheme.Session> {
        return this.create({
            clientId,
            
            expiredAt,
            createdAt: new Date(),
            type: Scheme.SessionType.UserSession,
            loggedOutAt: null
        });
    }

    public async createUserApiKey(
        clientId: string
    ): Promise<Scheme.Session> {
        return this.create({
            clientId,
            
            expiredAt: null,
            createdAt: new Date(),
            type: Scheme.SessionType.UserApiKey,
            loggedOutAt: null
        });
    }

    public async createProjectApiKey(
        clientId: string,
        projectId: string
    ): Promise<Scheme.Session> {
        return this.create({
            clientId,
            projectId,
            
            expiredAt: null,
            createdAt: new Date(),
            type: Scheme.SessionType.ProjectApiKey,
            loggedOutAt: null
        });
    }

    public async getById(sessionId: string): Promise<Scheme.Session> {
        return this.getRaw({ id: sessionId });
    }

    public async getByIdAndTypeActiveOnly(sessionId: string, type: Scheme.SessionType): Promise<Scheme.Session> {
        const filters: any = {
            id: sessionId,
            type,
            loggedOutAt: null
        };

        if (type === Scheme.SessionType.UserSession) {
            filters.expiredAt = { $gt: new Date() };
        }

        return this.getRaw(filters);
    }

    public async listByUserInfo(clientId: string, projectId: string = null): Promise<Array<Scheme.Session>> {
        return this.listRaw({
            clientId,
            projectId,
        });
    }

    public async listByTypeAndUserInfoActiveOnly(
        type: Scheme.SessionType,
        clientId: string,
        projectId: string = null
    ): Promise<Array<Scheme.Session>> {
        const filters: any = {
            clientId,
            projectId,
            type,
            loggedOutAt: null
        };

        if (type === Scheme.SessionType.UserSession) {
            filters.expiredAt = { $gt: new Date() };
        }

        return this.listRaw(filters);
    }

    public async setExpiredAt(sessionId: string, expiredAt: Date): Promise<void> {
        await this.updateRaw({
            id: sessionId,
            type: Scheme.SessionType.UserSession
        }, {
            $set: {
                expiredAt
            }
        });
    }

    public async disableUserSession(sessionId: string): Promise<void> {
        await this.disableSession(sessionId, Scheme.SessionType.UserSession);
    }

    public async disableUserApiKey(sessionId: string): Promise<void> {
        await this.disableSession(sessionId, Scheme.SessionType.UserApiKey);
    }

    public async disableProjectApiKey(sessionId: string): Promise<void> {
        await this.disableSession(sessionId, Scheme.SessionType.ProjectApiKey);
    }

    private async disableSession(sessionId: string, type: Scheme.SessionType): Promise<void> {
        await this.updateRaw({
            id: sessionId,
            type
        }, {
            $set: {
                loggedOutAt: new Date()
            }
        });
    }
}
