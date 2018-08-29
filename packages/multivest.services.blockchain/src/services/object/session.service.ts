import { MultivestError, PluginManager, Service } from '@fluencesh/multivest.core';
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
        clientId: string,
        projectId: string = null
    ): Promise<Scheme.Session> {
        const [ client, project ] = [
            this.clientDao.getById(clientId),
            projectId ? this.projectDao.getById(projectId) : null
        ] as [ Promise<Scheme.Client>, Promise<Scheme.Project> ];

        if (!client) {
            throw new MultivestError(Errors.CLIENT_NOT_FOUND);
        } else if (projectId && !project) {
            throw new MultivestError(Errors.PROJECT_NOT_FOUND);
        }

        return this.sessionDao.createSession(expiredAt, clientId, projectId);
    }

    public async getById(sessionId: string): Promise<Scheme.Session> {
        return this.sessionDao.getById(sessionId);
    }

    public async getByIdActiveOnly(sessionId: string): Promise<Scheme.Session> {
        return this.sessionDao.getByIdActiveOnly(sessionId);
    }

    public async getByClientIdAndProjectId(clientId: string): Promise<Scheme.Session> {
        return this.sessionDao.getByClientIdAndProjectId(clientId);
    }

    public async getByClientIdAndProjectIdActiveOnly(clientId: string, projectId: string): Promise<Scheme.Session> {
        return this.sessionDao.getByClientIdAndProjectIdActiveOnly(clientId, projectId);
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
