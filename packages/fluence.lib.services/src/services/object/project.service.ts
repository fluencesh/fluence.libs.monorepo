import { Plugin as MongoPlugin } from '@applicature/synth.mongodb';
import { MultivestError, Service } from '@applicature/synth.plugin-manager';
import { createHash } from 'crypto';
import { generate } from 'randomstring';
import { DaoIds } from '../../constants';
import { ProjectDao } from '../../dao/project.dao';
import { Errors } from '../../errors';
import { Scheme } from '../../types';
import { AddressSubscriptionService } from './address.subscription.service';
import { EthereumContractSubscriptionService } from './ethereum.contract.subscription.service';
import { OraclizeSubscriptionService } from './oraclize.subscription.service';
import { ProjectBlockchainSetupService } from './project.blockchain.setup.service';
import { TransactionHashSubscriptionService } from './transaction.hash.subscription.service';
import { FabricContractCreationSubscriptionService } from './fabric.contract.creation.subscription.service';

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
    protected oraclizeSubscriptionService: OraclizeSubscriptionService;
    protected fabricContractCreationService: FabricContractCreationSubscriptionService;
    protected projectBlockchainSetupService: ProjectBlockchainSetupService;

    public async init(): Promise<void> {
        const mongodbPlugin = this.pluginManager.get('mongodb') as MongoPlugin;

        this.projectDao = await mongodbPlugin.getDao(DaoIds.Project) as ProjectDao;

        this.addressSubscriptionService = this.pluginManager.getServiceByClass(AddressSubscriptionService);
        this.transactionHashSubscriptionService = this.pluginManager
            .getServiceByClass(TransactionHashSubscriptionService);
        this.contractSubscriptionService = this.pluginManager.getServiceByClass(EthereumContractSubscriptionService);
        this.oraclizeSubscriptionService = this.pluginManager.getServiceByClass(OraclizeSubscriptionService);
        this.fabricContractCreationService = this.pluginManager
            .getServiceByClass(FabricContractCreationSubscriptionService);

        this.projectBlockchainSetupService = this.pluginManager.getServiceByClass(ProjectBlockchainSetupService);
        
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

    /**
     * Returns project by ID
     * @param projectId - value from `id` field in DB
     */
    public async getById(projectId: string): Promise<Scheme.Project> {
        return this.projectDao.getById(projectId);
    }

    /**
     * Returns project which was not deleted and have status as `ACTIVE`
     * @param projectId - value from `id` field in DB
     */
    public async getByIdActiveOnly(projectId: string): Promise<Scheme.Project> {
        return this.projectDao.getByIdActiveOnly(projectId);
    }

    /**
     * Returns project which was not deleted and may have any value in `status` field
     * @param projectId - value from `id` field in DB
     */
    public async getByIdExistsOnly(projectId: string): Promise<Scheme.Project> {
        return this.projectDao.getByIdExistsOnly(projectId);
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
        webhookUrl?: string,
        clientId?: string
    ): Promise<Array<Scheme.Project>> {
        return this.projectDao.listByFilters(name, sharedSecret, status, webhookUrl, clientId);
    }

    public async listByFiltersActiveOnly(
        name?: string,
        sharedSecret?: string,
        status?: Scheme.ProjectStatus,
        webhookUrl?: string,
        clientId?: string
    ): Promise<Array<Scheme.Project>> {
        return this.projectDao.listByFiltersActiveOnly(name, sharedSecret, status, webhookUrl, clientId);
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

        const projectUpdate = this.projectDao.setNameAndWebhookUrlAndStatus(projectId, name, webhookUrl, status);

        await Promise.all([projectUpdate, subscriptionUpdate]);
    }

    public async setStatus(projectId: string, status: Scheme.ProjectStatus): Promise<void> {
        let isActive: boolean;
        let setupStatus: Scheme.ProjectBlockchainSetupStatus;
        if (status === Scheme.ProjectStatus.Active) {
            isActive = true;
            setupStatus = Scheme.ProjectBlockchainSetupStatus.Enabled;
        } else {
            isActive = false;
            setupStatus = Scheme.ProjectBlockchainSetupStatus.Disabled;
        }

        await Promise.all([
            this.projectDao.setStatus(projectId, status),
            this.modifySubscriptionStatus(projectId, isActive),
            this.projectBlockchainSetupService.setStatusByProjectId(projectId, setupStatus)
        ]);
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

        await this.projectDao.setToken(project.id, project.saltyToken, project.salt);

        return project;
    }

    public generateSaltyToken(token: string, salt: string) {
        return createHash('sha256')
            .update(token)
            .update(salt)
            .digest('hex');
    }

    public async removeProject(projectId: string): Promise<void> {
        // FIXME: should be wrapped into transaction
        await Promise.all([
            this.projectDao.removeProject(projectId),
            this.projectBlockchainSetupService.setStatusByProjectId(
                projectId,
                Scheme.ProjectBlockchainSetupStatus.Disabled
            )
        ]);
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
            this.contractSubscriptionService.setProjectActive(projectId, isActive),
            this.oraclizeSubscriptionService.setProjectActive(projectId, isActive),
            this.fabricContractCreationService.setProjectActive(projectId, isActive),
        ]);
    }
}
