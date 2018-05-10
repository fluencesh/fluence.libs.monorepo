import { PluginManager, Service } from '@applicature/multivest.core';
import { Plugin } from '@applicature/multivest.mongodb';
import { ProjectDao } from '../../dao/project.dao';
import { Scheme } from '../../types';
import { AddressSubscriptionService } from './address.subscription.service';
import { EthereumContractSubscriptionService } from './ethereum.contract.subscription.service';
import { TransactionHashSubscriptionService } from './transaction.hash.subscription.service';

export abstract class ProjectService extends Service {
    protected projectDao: ProjectDao;
    protected addressSubscriptionService: AddressSubscriptionService;
    protected transactionHashSubscriptionService: TransactionHashSubscriptionService;
    protected contractSubscriptionService: EthereumContractSubscriptionService;

    constructor(pluginManager: PluginManager) {
        super(pluginManager);
    }

    public async init(): Promise<void> {
        const mongodbPlugin = this.pluginManager.get('mongodb') as Plugin;

        this.projectDao = await mongodbPlugin.getDao('projects') as ProjectDao;

        this.addressSubscriptionService = this.pluginManager
            .getServiceByClass(AddressSubscriptionService) as AddressSubscriptionService;
        this.transactionHashSubscriptionService = this.pluginManager
            .getServiceByClass(TransactionHashSubscriptionService) as TransactionHashSubscriptionService;
        this.contractSubscriptionService = this.pluginManager
            .getServiceByClass(EthereumContractSubscriptionService) as EthereumContractSubscriptionService;
    }

    public getServiceId(): string {
        return 'object.projects';
    }

    public async createProject(
        clientId: string,
        name: string,
        webhookUrl: string,
        sharedSecret: string,
        status: Scheme.ProjectStatus,
        txMinConfirmations: number
    ): Promise<Scheme.Project> {
        return this.projectDao.createProject(
            clientId,
            name,
            webhookUrl,
            sharedSecret,
            status,
            txMinConfirmations
        );
    }

    public async getById(projectId: string): Promise<Scheme.Project> {
        return this.projectDao.getById(projectId);
    }

    public async getByIdActiveOnly(projectId: string): Promise<Scheme.Project> {
        return this.projectDao.getByIdActiveOnly(projectId);
    }

    public async listByClientId(clientId: string): Promise<Array<Scheme.Project>> {
        return this.projectDao.listByClientId(clientId);
    }

    public async listByClientIdActiveOnly(clientId: string): Promise<Array<Scheme.Project>> {
        return this.projectDao.listByClientIdActiveOnly(clientId);
    }

    public async listByIds(ids: Array<string>): Promise<Array<Scheme.Project>> {
        return this.projectDao.listByIds(ids);
    }

    public async listByIdsActiveOnly(ids: Array<string>): Promise<Array<Scheme.Project>> {
        return this.projectDao.listByIdsActiveOnly(ids);
    }

    public async listByFilters(
        name?: string,
        sharedSecret?: string,
        status?: Scheme.ProjectStatus,
        webhookUrl?: string
    ): Promise<Array<Scheme.Project>> {
        return this.projectDao.listByFilters(
            name,
            sharedSecret,
            status,
            webhookUrl
        );
    }

    public async listByFiltersActiveOnly(
        name?: string,
        sharedSecret?: string,
        status?: Scheme.ProjectStatus,
        webhookUrl?: string
    ): Promise<Array<Scheme.Project>> {
        return this.projectDao.listByFiltersActiveOnly(
            name,
            sharedSecret,
            status,
            webhookUrl
        );
    }

    public async setNameAndWebhookUrlAndStatus(
        projectId: string,
        name?: string,
        webhookUrl?: string,
        status?: Scheme.ProjectStatus
    ): Promise<void> {
        let subscriptionUpdate: Promise<void> = Promise.resolve();
        if (status) {
            const isActive = status === Scheme.ProjectStatus.Active;

            subscriptionUpdate = this.modifySubscriptionStatus(projectId, isActive);
        }

        const projectUpdate = this.projectDao.setNameAndWebhookUrlAndStatus(
            projectId,
            name,
            webhookUrl,
            status
        );

        await Promise.all([
            projectUpdate,
            subscriptionUpdate
        ]);
    }

    public async setStatus(projectId: string, status: Scheme.ProjectStatus): Promise<void> {
        const isActive = status === Scheme.ProjectStatus.Active;

        await Promise.all([
            this.projectDao.setStatus(projectId, status),
            this.modifySubscriptionStatus(projectId, isActive)
        ]);

        return;
    }

    public async getByApiKey(apiKey: string) {
        return this.projectDao.getByApiKey(apiKey);
    }

    public async removeProject(projectId: string): Promise<void> {
        await this.projectDao.removeProject(projectId);
    }

    private async modifySubscriptionStatus(projectId: string, isActive: boolean): Promise<any> {
        return Promise.all([
            this.addressSubscriptionService.setProjectActive(projectId, isActive),
            this.transactionHashSubscriptionService.setProjectActive(projectId, isActive),
            this.contractSubscriptionService.setProjectActive(projectId, isActive)
        ]);
    }
}
