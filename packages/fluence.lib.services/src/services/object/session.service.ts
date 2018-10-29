import { MultivestError, PluginManager, Service } from '@applicature/core.plugin-manager';
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

    public async createUserSession(
        clientId: string,
        expiredAt: Date
    ): Promise<Scheme.Session> {
        const client = await this.clientDao.getById(clientId);

        if (!client) {
            throw new MultivestError(Errors.CLIENT_NOT_FOUND);
        }

        return this.sessionDao.createUserSession(clientId, expiredAt);
    }

    public async createUserApiKey(
        clientId: string
    ): Promise<Scheme.Session> {
        const client = await this.clientDao.getById(clientId);

        if (!client) {
            throw new MultivestError(Errors.CLIENT_NOT_FOUND);
        }

        return this.sessionDao.createUserApiKey(clientId);
    }

    public async createProjectApiKey(
        clientId: string,
        projectId: string
    ): Promise<Scheme.Session> {
        const [ client, project ] = await Promise.all([
            this.clientDao.getById(clientId),
            this.projectDao.getById(projectId)
        ]) as [ Scheme.Client, Scheme.Project ];

        if (!client) {
            throw new MultivestError(Errors.CLIENT_NOT_FOUND);
        } else if (!project) {
            throw new MultivestError(Errors.PROJECT_NOT_FOUND);
        }

        return this.sessionDao.createProjectApiKey(clientId, projectId);
    }

    public async getById(sessionId: string): Promise<Scheme.Session> {
        return this.sessionDao.getById(sessionId);
    }

    public async getByIdAndTypeActiveOnly(sessionId: string, type: Scheme.SessionType): Promise<Scheme.Session> {
        return this.sessionDao.getByIdAndTypeActiveOnly(sessionId, type);
    }

    public async listByUserInfo(clientId: string, projectId: string = null): Promise<Array<Scheme.Session>> {
        return this.sessionDao.listByUserInfo(clientId, projectId);
    }

    public async listByTypeAndUserInfoActiveOnly(
        type: Scheme.SessionType,
        clientId: string,
        projectId: string = null
    ): Promise<Array<Scheme.Session>> {
        return this.sessionDao.listByTypeAndUserInfoActiveOnly(type, clientId, projectId);
    }

    public async setExpiredAt(sessionId: string, expiredAt: Date): Promise<void> {
        await this.sessionDao.setExpiredAt(sessionId, expiredAt);
    }

    public async disableUserSession(sessionId: string) {
        await this.sessionDao.disableUserSession(sessionId);
    }

    public async disableUserApiKey(sessionId: string) {
        await this.sessionDao.disableUserApiKey(sessionId);
    }

    public async disableProjectApiKey(sessionId: string) {
        await this.sessionDao.disableProjectApiKey(sessionId);
    }
}
