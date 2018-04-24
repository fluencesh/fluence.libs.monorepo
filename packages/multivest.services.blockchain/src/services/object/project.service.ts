import { PluginManager, Service } from '@applicature/multivest.core';
import { Plugin } from '@applicature/multivest.mongodb';
import { ProjectDao } from '../../dao/project.dao';
import { Scheme } from '../../types';

export abstract class ProjectService extends Service {
    protected projectDao: ProjectDao;

    constructor(pluginManager: PluginManager) {
        super(pluginManager);
    }

    public async init(): Promise<void> {
        const mongodbPlugin = this.pluginManager.get('mongodb') as Plugin;

        this.projectDao = await mongodbPlugin.getDao('projects') as ProjectDao;
    }

    public getServiceId(): string {
        return 'object.projects';
    }

    public async createProject(
        clientId: string,
        name: string,
        webhookUrl: string,
        sharedSecret: string,
        status: Scheme.ProjectStatus
    ): Promise<Scheme.Project> {
        return this.projectDao.createProject(clientId, name, webhookUrl, sharedSecret, status);
    }

    public async getById(projectId: string): Promise<Scheme.Project> {
        return this.projectDao.getById(projectId);
    }

    public async listByClientId(clientId: string): Promise<Array<Scheme.Project>> {
        return this.projectDao.listByClientId(clientId);
    }

    public async setNameAndWebhookUrlAndStatus(
        projectId: string,
        name: string, webhookUrl: string, status: Scheme.ProjectStatus
    ): Promise<void> {
        return this.projectDao.setNameAndWebhookUrlAndStatus(projectId, name, webhookUrl, status);
    }

    public async setStatus(projectId: string, status: Scheme.ProjectStatus): Promise<void> {
        return this.projectDao.setStatus(projectId, status);
    }

    public async getByApiKey(apiKey: string) {
        return this.projectDao.getByApiKey(apiKey);
    }
}
