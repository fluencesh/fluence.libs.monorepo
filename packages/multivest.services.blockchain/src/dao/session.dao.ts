import { Dao } from '@fluencesh/multivest.core';
import { Scheme } from '../types';

export abstract class SessionDao extends Dao<Scheme.Session> {
    public abstract createSession(
        expiredAt: Date,
        clientId: string,
        projectId?: string
    ): Promise<Scheme.Session>;

    public abstract getById(sessionId: string): Promise<Scheme.Session>;
    public abstract getByIdActiveOnly(sessionId: string): Promise<Scheme.Session>;
    public abstract getByClientIdAndProjectId(clientId: string, projectId: string): Promise<Scheme.Session>;
    public abstract getByClientIdAndProjectIdActiveOnly(clientId: string, projectId: string): Promise<Scheme.Session>;

    public abstract listByClientId(clientId: string): Promise<Array<Scheme.Session>>;
    public abstract listByClientIdActiveOnly(clientId: string): Promise<Array<Scheme.Session>>;

    public abstract logOut(sessionId: string): Promise<void>;
}
