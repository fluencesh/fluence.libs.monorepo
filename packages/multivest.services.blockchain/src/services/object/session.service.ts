import { MultivestError, PluginManager, Service } from '@applicature-private/multivest.core';
import { DaoIds } from '../../constants';
import { ClientDao } from '../../dao/client.dao';
import { ProjectDao } from '../../dao/project.dao';
import { SessionDao } from '../../dao/session.dao';
import { Errors } from '../../errors';
import { Scheme } from '../../types';

// TODO: finish service, create tests and integrate it in authentication.ms
export class SessionService extends Service {
    private sessionDao: SessionDao;
    private clientDao: ClientDao;
    private projectDao: ProjectDao;

    constructor(pm: PluginManager) {
        super(pm);

        this.sessionDao = this.pluginManager.getDao(DaoIds.Session) as SessionDao;
        this.clientDao = this.pluginManager.getDao(DaoIds.Client) as ClientDao;
        this.projectDao = this.pluginManager.getDao(DaoIds.Project) as ProjectDao;
    }

    public getServiceId() {
        return 'session.service';
    }

    public async createSession(
        expiredAt: Date,
        clientId: string
    ): Promise<Scheme.Session> {
        const client = await this.clientDao.getById(clientId);

        if (!client) {
            throw new MultivestError(Errors.CLIENT_NOT_FOUND);
        }

        return this.sessionDao.createSession(expiredAt, clientId);
    }

    public async getById(sessionId: string): Promise<Scheme.Session> {
        return this.sessionDao.getById(sessionId);
    }

    public async getByIdActiveOnly(sessionId: string): Promise<Scheme.Session> {
        return this.sessionDao.getByIdActiveOnly(sessionId);
    }

    public async getByClientId(clientId: string): Promise<Scheme.Session> {
        return this.sessionDao.getByClientId(clientId);
    }

    public async getByClientIdActiveOnly(clientId: string): Promise<Scheme.Session> {
        return this.sessionDao.getByClientIdActiveOnly(clientId);
    }

    public async setExpiredAt(sessionId: string, expiredAt: Date): Promise<void> {
        await this.sessionDao.setExpiredAt(sessionId, expiredAt);

        return;
    }

    public async logOut(sessionId: string) {
        await this.sessionDao.logOut(sessionId);

        return;
    }
}
