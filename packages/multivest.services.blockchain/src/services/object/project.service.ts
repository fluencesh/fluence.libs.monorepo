import { MultivestError, PluginManager, Service } from '@applicature/multivest.core';
import { Plugin } from '@applicature/multivest.mongodb';
import * as config from 'config';
import { createHash } from 'crypto';
import * as jwt from 'jsonwebtoken';
import { generate } from 'randomstring';
import { v1 as generateId } from 'uuid';
import { ProjectDao } from '../../dao/project.dao';
import { Errors } from '../../errors';
import { Scheme } from '../../types';
import { AddressSubscriptionService } from './address.subscription.service';
import { EthereumContractSubscriptionService } from './ethereum.contract.subscription.service';
import { TransactionHashSubscriptionService } from './transaction.hash.subscription.service';

const generateRandomHash = () => generate({ charset: '0123456789abcdef', length: 64 });

interface TokenData {
    token: string;
    salt: string;
    saltyToken: string;
}

export class ProjectService extends Service {
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
        const tokenData = this.createToken();

        const project = await this.projectDao.createProject(
            clientId,
            name,
            webhookUrl,
            sharedSecret,
            status,
            txMinConfirmations,
            tokenData.saltyToken,
            tokenData.salt
        );

        project.token = tokenData.token;

        return project;
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

    public async removeProject(projectId: string): Promise<void> {
        await this.projectDao.removeProject(projectId);
    }

    public async changeToken(projectId: string): Promise<Scheme.Project> {
        const project = await this.getById(projectId);
        if (!project) {
            throw new MultivestError(Errors.PROJECT_NOT_FOUND);
        }

        const tokenData = this.createToken();
        project.token = tokenData.token;
        project.salt = tokenData.salt;
        project.saltyToken = tokenData.saltyToken;

        this.projectDao.setToken(
            project.id,
            project.saltyToken,
            project.salt
        );

        return project;
    }

    public generateSaltyToken(token: string, salt: string) {
        return createHash('sha256')
            .update(token)
            .update(salt)
            .digest('hex');
    }

    private createToken(): TokenData {
        const token = generateRandomHash();
        const salt = generateRandomHash();
        const saltyToken = this.generateSaltyToken(token, salt);

        return {
            token,
            salt,
            saltyToken
        };
    }

    private async modifySubscriptionStatus(projectId: string, isActive: boolean): Promise<any> {
        return Promise.all([
            this.addressSubscriptionService.setProjectActive(projectId, isActive),
            this.transactionHashSubscriptionService.setProjectActive(projectId, isActive),
            this.contractSubscriptionService.setProjectActive(projectId, isActive)
        ]);
    }
}
