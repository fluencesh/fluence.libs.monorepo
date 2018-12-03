import { Service } from '@applicature/synth.plugin-manager';
import { Plugin as MongoPlugin } from '@applicature/synth.mongodb';
import { FabricContractCreationSubscriptionDao } from '../../dao';
import { DaoIds } from '../../constants';
import { Scheme } from '../../types';

export class FabricContractCreationService extends Service {
    private dao: FabricContractCreationSubscriptionDao;

    public getServiceId() {
        return 'fabric.contract.creation.service';
    }

    public async init() {
        const mongoPlugin = this.pluginManager.get('mongodb') as MongoPlugin;

        this.dao = await mongoPlugin.getDao(DaoIds.FabricContractCreation) as any;
    }

    public async createSubscription(
        clientId: string,
        projectId: string,
        transportConnectionId: string,
        methodName: string,
        inputTypes: Array<string>,
        minConfirmations: number
    ): Promise<Scheme.FabricContractCreation> {
        return this.dao.createSubscription(
            clientId,
            projectId,
            transportConnectionId,
            methodName,
            inputTypes,
            minConfirmations
        );
    }

    public async getById(subscriptionId: string): Promise<Scheme.FabricContractCreation> {
        return this.dao.getById(subscriptionId);
    }

    public async getByIdActiveOnly(subscriptionId: string): Promise<Scheme.FabricContractCreation> {
        return this.dao.getByIdActiveOnly(subscriptionId);
    }

    public async listByProjectId(projectId: string): Promise<Array<Scheme.FabricContractCreation>> {
        return this.dao.listByProjectId(projectId);
    }

    public async listByProjectIdActiveOnly(projectId: string): Promise<Array<Scheme.FabricContractCreation>> {
        return this.dao.listByProjectIdActiveOnly(projectId);
    }

    public async listByClientId(clientId: string): Promise<Array<Scheme.FabricContractCreation>> {
        return this.dao.listByClientId(clientId);
    }

    public async listByClientIdActiveOnly(clientId: string): Promise<Array<Scheme.FabricContractCreation>> {
        return this.dao.listByClientIdActiveOnly(clientId);
    }

    public async setSubscribed(
        id: string,
        subscribed: boolean
    ): Promise<void> {
        return this.dao.setSubscribed(id, subscribed);
    }

    public async setSubscribedByProjectId(
        projectId: string,
        subscribed: boolean
    ): Promise<void> {
        return this.dao.setSubscribedByProjectId(projectId, subscribed);
    }

    public async setSubscribedByClientId(
        clientId: string,
        subscribed: boolean
    ): Promise<void> {
        return this.dao.setSubscribedByClientId(clientId, subscribed);
    }

    public async setClientActive(
        clientId: string,
        clientActive: boolean
    ): Promise<void> {
        return this.dao.setClientActive(clientId, clientActive);
    }

    public async setProjectActive(
        projectId: string,
        projectActive: boolean
    ): Promise<void> {
        return this.dao.setProjectActive(projectId, projectActive);
    }
}
