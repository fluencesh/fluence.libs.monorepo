import { Dao } from '@applicature/multivest.core';
import { Scheme } from '../types';

export abstract class ProjectDao extends Dao<Scheme.Project> {
    public abstract async createProject(
        clientId: string,
        name: string,
        webhookUrl: string,
        sharedSecret: string,
        status: Scheme.ProjectStatus,
        txMinConfirmations: number
    ): Promise<Scheme.Project>;

    public abstract async getById(projectId: string): Promise<Scheme.Project>;
    public abstract async getByIdActiveOnly(projectId: string): Promise<Scheme.Project>;
    public abstract async getByApiKey(apiKey: string): Promise<Scheme.Project>;
    public abstract async getByApiKeyActiveOnly(apiKey: string): Promise<Scheme.Project>;

    public abstract async listByClientId(clientId: string): Promise<Array<Scheme.Project>>;
    public abstract async listByClientIdActiveOnly(clientId: string): Promise<Array<Scheme.Project>>;
    public abstract async listByIds(ids: Array<string>): Promise<Array<Scheme.Project>>;
    public abstract async listByIdsActiveOnly(ids: Array<string>): Promise<Array<Scheme.Project>>;
    public abstract async listByFilters(
        name?: string,
        sharedSecret?: string,
        status?: Scheme.ProjectStatus,
        webhookUrl?: string
    ): Promise<Array<Scheme.Project>>;
    public abstract async listByFiltersActiveOnly(
        name?: string,
        sharedSecret?: string,
        status?: Scheme.ProjectStatus,
        webhookUrl?: string
    ): Promise<Array<Scheme.Project>>;

    public abstract async setNameAndWebhookUrlAndStatus(
        projectId: string,
        name?: string,
        webhookUrl?: string,
        status?: Scheme.ProjectStatus
    ): Promise<void>;

    public abstract async setStatus(projectId: string, status: Scheme.ProjectStatus): Promise<void>;

    public abstract async removeProject(projectId: string): Promise<void>;
}
