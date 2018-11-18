import { Plugin } from '@applicature/synth.mongodb';
import { PluginManager, Service } from '@applicature/synth.plugin-manager';
import { sha3 } from 'ethereumjs-util';
import { DaoIds } from '../../constants';
import { OraclizeSubscriptionDao } from '../../dao/oraclize.subscription.dao';
import { Scheme } from '../../types';

export class OraclizeSubscriptionService extends Service {
    protected dao: OraclizeSubscriptionDao;

    public async init(): Promise<void> {
        const mongodbPlugin = this.pluginManager.get('mongodb') as any as Plugin;

        this.dao = await mongodbPlugin.getDao(DaoIds.Oraclize) as OraclizeSubscriptionDao;
    }

    public getServiceId() {
        return 'oraclize.subscription.service';
    }

    public async createSubscription(
        clientId: string,
        projectId: string,
        transportConnectionId: string,
        minConfirmations: number,
        eventName: string,
        eventInputTypes: Array<string>,
        webhookUrl: string
    ): Promise<Scheme.OraclizeSubscription> {
        const eventHash = this.prepareEventTopicHash(eventName, eventInputTypes);

        return this.dao.createSubscription(
            clientId,
            projectId,
            transportConnectionId,
            minConfirmations,
            eventHash,
            eventName,
            eventInputTypes,
            webhookUrl
        );
    }

    public async getById(oraclizeId: string): Promise<Scheme.OraclizeSubscription> {
        return this.dao.getById(oraclizeId);
    }

    public async getByIdAndProjectId(oraclizeId: string, projectId: string): Promise<Scheme.OraclizeSubscription> {
        return this.dao.getByIdAndProjectId(oraclizeId, projectId);
    }

    public async listByEventHash(eventHash: string): Promise<Array<Scheme.OraclizeSubscription>> {
        return this.dao.listByEventHash(eventHash);
    }

    public async listByEventHashAndStatus(
        eventHash: string,
        subscribed: boolean
    ): Promise<Array<Scheme.OraclizeSubscription>> {
        return this.dao.listByEventHashAndStatus(eventHash, subscribed);
    }

    public async listByEventHashes(eventHashes: Array<string>): Promise<Array<Scheme.OraclizeSubscription>> {
        return this.dao.listByEventHashes(eventHashes);
    }

    public async listByEventHashesAndStatus(
        eventHashes: Array<string>,
        subscribed: boolean
    ): Promise<Array<Scheme.OraclizeSubscription>> {
        return this.dao.listByEventHashesAndStatus(eventHashes, subscribed);
    }

    public async listByProjectId(projectId: string): Promise<Array<Scheme.OraclizeSubscription>> {
        return this.dao.listByProjectId(projectId);
    }

    public async listByStatus(subscribed: boolean): Promise<Array<Scheme.OraclizeSubscription>> {
        return this.dao.listByStatus(subscribed);
    }

    public async listByStatusAndProjectId(
        subscribed: boolean,
        projectId: string
    ): Promise<Array<Scheme.OraclizeSubscription>> {
        return this.dao.listByStatusAndProjectId(subscribed, projectId);
    }

    public async list(): Promise<Array<Scheme.OraclizeSubscription>> {
        return this.dao.list({});
    }

    public async setSubscribed(oraclizeId: string, subscribed: boolean): Promise<void> {
        await this.dao.setSubscribed(oraclizeId, subscribed);
    }

    public async setSubscribedByProjectId(projectId: string, subscribed: boolean): Promise<void> {
        await this.dao.setSubscribedByProjectId(projectId, subscribed);
    }

    public async setSubscribedByClientId(clientId: string, subscribed: boolean): Promise<void> {
        await this.dao.setSubscribedByClientId(clientId, subscribed);
    }

    public async setClientActive(
        clientId: string,
        isActive: boolean
    ): Promise<void> {
        return this.dao.setClientActive(clientId, isActive);
    }

    public async setProjectActive(
        projectId: string,
        isActive: boolean
    ): Promise<void> {
        return this.dao.setProjectActive(projectId, isActive);
    }

    protected prepareEventTopicHash(methodName: string, inputParams: Array<string>) {
        const eventMethodSignature = `${ methodName }(${ inputParams.join(',') })`;
        const eventHash = (sha3(eventMethodSignature) as Buffer).toString('hex');

        return `0x${ eventHash }`;
    }
}
