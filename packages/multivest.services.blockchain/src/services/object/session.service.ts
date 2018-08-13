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
        clientId: string,
        projectId?: string
    ): Promise<Scheme.Session> {
        const promises = [];

        // THINK: If user is inactive, then session still should be created?
        promises.push(this.clientDao.getById(clientId));
        if (projectId) {
            promises.push(this.projectDao.getByIdActiveOnly(projectId));
        }

        const [ client, project ] = await Promise.all(
            promises as [ Promise<Scheme.Client>, Promise<Scheme.Project> ]
        );

        if (!client) {
            throw new MultivestError(Errors.CLIENT_NOT_FOUND);
        } else if (projectId && !project) {
            throw new MultivestError(Errors.PROJECT_NOT_FOUND);
        } else if (projectId && project.status === Scheme.ProjectStatus.Inactive) {
            throw new MultivestError(Errors.PROJECT_IS_INACTIVE);
        }

        return this.sessionDao.createSession(expiredAt, clientId, projectId);
    }

    public async getById(sessionId: string): Promise<Scheme.Session> {
        return this.sessionDao.getById(sessionId);
    }

    public async getByIdActiveOnly(sessionId: string): Promise<Scheme.Session> {
        return this.sessionDao.getByIdActiveOnly(sessionId);
    }

    public async getByClientIdAndProjectId(clientId: string, projectId: string): Promise<Scheme.Session> {
        return this.sessionDao.getByClientIdAndProjectId(clientId, projectId);
    }

    public async getByClientIdAndProjectIdActiveOnly(clientId: string, projectId: string): Promise<Scheme.Session> {
        return this.sessionDao.getByClientIdAndProjectIdActiveOnly(clientId, projectId);
    }

    public async logOut(sessionId: string) {
        return this.sessionDao.logOut(sessionId);
    }
}
