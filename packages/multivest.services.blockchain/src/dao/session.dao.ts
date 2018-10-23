import { Dao } from '@applicature-private/multivest.core';
import { Scheme } from '../types';

export abstract class SessionDao extends Dao<Scheme.Session> {
    public abstract createUserSession(
        clientId: string,
        expiredAt: Date
    ): Promise<Scheme.Session>;

    public abstract createUserApiKey(
        clientId: string
    ): Promise<Scheme.Session>;

    public abstract createProjectApiKey(
        clientId: string,
        projectId: string
    ): Promise<Scheme.Session>;

    public abstract getById(sessionId: string): Promise<Scheme.Session>;
    public abstract getByIdAndTypeActiveOnly(sessionId: string, type: Scheme.SessionType): Promise<Scheme.Session>;

    public abstract listByUserInfo(clientId: string, projectId?: string): Promise<Array<Scheme.Session>>;
    public abstract listByTypeAndUserInfoActiveOnly(
        type: Scheme.SessionType,
        clientId: string,
        projectId?: string
    ): Promise<Array<Scheme.Session>>;

    public abstract setExpiredAt(sessionId: string, expiredAt: Date): Promise<void>;

    public abstract disableUserSession(sessionId: string): Promise<void>;
    public abstract disableUserApiKey(sessionId: string): Promise<void>;
    public abstract disableProjectApiKey(sessionId: string): Promise<void>;
}
