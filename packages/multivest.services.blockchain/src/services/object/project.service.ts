import {PluginManager, Service} from '@applicature/multivest.core';
import { ProjectDao } from '../../dao/project.dao';
import { Scheme } from '../../types';

export abstract class ProjectService extends Service {
    protected projectDao: ProjectDao;

    constructor(pluginManager: PluginManager) {
        super(pluginManager);

        // @TODO: set project dao
    }

    public getServiceId(): string {
        return 'object.projects';
    }

    public async createProject(
        clientId: string,
        name: string,
        webHookUrl: string,
        sharedSecret: string,
        status: Scheme.ProjectStatus
    ): Promise<Scheme.Project> {
        return this.projectDao.createProject(clientId, name, webHookUrl, sharedSecret, status);
    }

    public async getById(projectId: string): Promise<Scheme.Project> {
        return this.projectDao.getById(projectId);
    }

    public async listByClientId(clientId: string): Promise<Array<Scheme.Project>> {
        return this.projectDao.listByClientId(clientId);
    }

    public async setNameAndWebhookUrlAndStatus(
        projectId: string,
        name: string, webHookUrl: string, status: Scheme.ProjectStatus
    ): Promise<void> {
        return this.projectDao.setNameAndWebhookUrlAndStatus(projectId, name, webHookUrl, status);
    }

    public async setStatus(projectId: string, status: Scheme.ProjectStatus): Promise<void> {
        return this.projectDao.setStatus(projectId, status);
    }
}
