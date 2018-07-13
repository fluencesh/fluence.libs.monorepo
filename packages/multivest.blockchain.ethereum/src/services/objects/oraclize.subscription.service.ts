import { PluginManager, Service } from '@applicature/multivest.core';
import { sha3 } from 'ethereumjs-util';
import { DaoIds, ServiceIds } from '../../constants';
import { OraclizeSubscriptionDao } from '../../dao/oraclize.subscription.dao';
import { OraclizeStatus, OraclizeSubscription } from '../../types';

export class OraclizeSubscriptionService extends Service {
    protected dao: OraclizeSubscriptionDao;

    constructor(pluginManager: PluginManager) {
        super(pluginManager);

        this.dao = pluginManager.getDao(DaoIds.Oraclize) as OraclizeSubscriptionDao;
    }

    public getServiceId() {
        return ServiceIds.Oraclize;
    }

    public async createOraclize(
        projectId: string,
        eventName: string,
        eventInputTypes: Array<string>,
        webhookUrl: string
    ): Promise<OraclizeSubscription> {
        const eventHash = this.prepareEventTopicHash(eventName, eventInputTypes);

        return this.dao.createOraclize(projectId, eventHash, eventName, eventInputTypes, webhookUrl);
    }

    public async getById(oraclizeId: string): Promise<OraclizeSubscription> {
        return this.dao.getById(oraclizeId);
    }

    public async getByIdAndProjectId(oraclizeId: string, projectId: string): Promise<OraclizeSubscription> {
        return this.dao.getByIdAndProjectId(oraclizeId, projectId);
    }

    public async listByEventHash(eventHash: string): Promise<Array<OraclizeSubscription>> {
        return this.dao.listByEventHash(eventHash);
    }

    public async listByEventHashAndStatus(
        eventHash: string,
        status: OraclizeStatus
    ): Promise<Array<OraclizeSubscription>> {
        return this.dao.listByEventHashAndStatus(eventHash, status);
    }

    public async listByEventHashes(eventHashes: Array<string>): Promise<Array<OraclizeSubscription>> {
        return this.dao.listByEventHashes(eventHashes);
    }

    public async listByEventHashesAndStatus(
        eventHashes: Array<string>,
        status: OraclizeStatus
    ): Promise<Array<OraclizeSubscription>> {
        return this.dao.listByEventHashesAndStatus(eventHashes, status);
    }

    public async listByProjectId(projectId: string): Promise<Array<OraclizeSubscription>> {
        return this.dao.listByProjectId(projectId);
    }

    public async listByStatus(status: OraclizeStatus): Promise<Array<OraclizeSubscription>> {
        return this.dao.listByStatus(status);
    }

    public async listByStatusAndProjectId(
        status: OraclizeStatus,
        projectId: string
    ): Promise<Array<OraclizeSubscription>> {
        return this.dao.listByStatusAndProjectId(status, projectId);
    }

    public async list(status: OraclizeStatus, projectId: string): Promise<Array<OraclizeSubscription>> {
        return this.dao.list({});
    }

    public async setStatus(oraclizeId: string, status: OraclizeStatus): Promise<void> {
        await this.dao.setStatus(oraclizeId, status);

        return;
    }

    protected prepareEventTopicHash(methodName: string, inputParams: Array<string>) {
        const eventMethodSignature = `${ methodName }(${ inputParams.join(',') })`;
        const eventHash = (sha3(eventMethodSignature) as Buffer).toString('hex');

        return `0x${ eventHash }`;
    }
}
