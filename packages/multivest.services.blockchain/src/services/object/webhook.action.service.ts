import {Hashtable, PluginManager, Service} from '@applicature-private/multivest.core';
import WebhookActionItem = Scheme.WebhookActionItem;
import { Plugin } from '@applicature-private/multivest.mongodb';
import { DaoIds } from '../../constants';
import { WebhookActionDao } from '../../dao/webhook.action.dao';
import { Scheme } from '../../types';

export class WebhookActionItemObjectService extends Service {
    protected webHookActionItemDao: WebhookActionDao;

    constructor(pluginManager: PluginManager) {
        super(pluginManager);
    }

    public async init(): Promise<void> {
        const mongodbPlugin = this.pluginManager.get('mongodb') as any as Plugin;

        this.webHookActionItemDao = await mongodbPlugin.getDao(DaoIds.WebhookAction) as WebhookActionDao;
    }

    public getServiceId(): string {
        return 'object.webhooks';
    }

    public async createAction(
        clientId: string,
        projectId: string,

        blockChainId: string,
        networkId: string,

        blockHash: string,
        blockHeight: number,
        blockTime: number,

        minConfirmations: number,
        confirmations: number,

        txHash: string,

        address: string,

        type: Scheme.WebhookTriggerType,
        refId: string, // AddressSubscription id or EthereumContractSubscription id

        eventId: string,
        params: Hashtable<any>
    ): Promise<Scheme.WebhookActionItem> {
        return this.webHookActionItemDao.createAction(
            clientId, projectId,
            blockChainId, networkId,

            blockHash, blockHeight, blockTime,

            minConfirmations, confirmations,

            txHash, address,

            type, refId,

            eventId,
            params
        );
    }

    public async fill(actionItems: Array<WebhookActionItem>): Promise<void> {
        await this.webHookActionItemDao.fill(actionItems);
    }

    public async getById(id: string): Promise<Scheme.WebhookActionItem> {
        return this.webHookActionItemDao.getById(id);
    }

    public async listByClientId(clientId: string): Promise<Array<Scheme.WebhookActionItem>> {
        return this.webHookActionItemDao.listByClientId(clientId);
    }

    public async listByProjectId(projectId: string): Promise<Array<Scheme.WebhookActionItem>> {
        return this.webHookActionItemDao.listByProjectId(projectId);
    }

    public async listByStatus(status: Scheme.WebhookReportItemStatus): Promise<Array<Scheme.WebhookActionItem>> {
        return this.webHookActionItemDao.listByStatus(status);
    }

    public async listByStatusAndType(
        status: Scheme.WebhookReportItemStatus,
        type: Scheme.WebhookTriggerType
    ): Promise<Array<Scheme.WebhookActionItem>> {
        return this.webHookActionItemDao.listByStatusAndType(status, type);
    }

    public async listByStatusAndTypes(
        status: Scheme.WebhookReportItemStatus,
        types: Array<Scheme.WebhookTriggerType>
    ): Promise<Array<Scheme.WebhookActionItem>> {
        return this.webHookActionItemDao.listByStatusAndTypes(status, types);
    }

    public async setConfirmationsAndStatus(
        id: string, confirmations: number, status: Scheme.WebhookReportItemStatus
    ): Promise<void> {
        return this.webHookActionItemDao.setConfirmationsAndStatus(id, confirmations, status);
    }

    public async setStatus(id: string, status: Scheme.WebhookReportItemStatus): Promise<void> {
        return this.webHookActionItemDao.setStatus(id, status);
    }

    public async addFailReport(id: string, fail: Scheme.WebhookFailedReport): Promise<void> {
        return this.webHookActionItemDao.addFailReport(id, fail);
    }
}
