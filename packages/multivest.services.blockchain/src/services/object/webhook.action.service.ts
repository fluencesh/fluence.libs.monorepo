import {Hashtable, PluginManager, Service} from '@applicature/multivest.core';
import WebHookActionItem = Scheme.WebHookActionItem;
import { Plugin } from '@applicature/multivest.mongodb';
import { WebHookActionDao } from '../../dao/webhook.action.dao';
import { Scheme } from '../../types';
import {TransactionDao} from '../../dao/transaction.dao';

export class WebhookActionItemObjectService extends Service {
    protected webHookActionItemDao: WebHookActionDao;

    constructor(pluginManager: PluginManager) {
        super(pluginManager);
    }

    public async init(): Promise<void> {
        const mongodbPlugin = this.pluginManager.get('mongodb') as Plugin;

        this.webHookActionItemDao = await mongodbPlugin.getDao('webhooks') as WebHookActionDao;
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
    ): Promise<Scheme.WebHookActionItem> {
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

    public async fill(actionItems: Array<WebHookActionItem>): Promise<void> {
        await this.webHookActionItemDao.fill(actionItems);

        return;
    }

    public async getById(id: string): Promise<Scheme.WebHookActionItem> {
        return this.webHookActionItemDao.getById(id);
    }

    public async listByClientId(clientId: string): Promise<Array<Scheme.WebHookActionItem>> {
        return this.webHookActionItemDao.listByClientId(clientId);
    }

    public async listByProjectId(projectId: string): Promise<Array<Scheme.WebHookActionItem>> {
        return this.webHookActionItemDao.listByProjectId(projectId);
    }

    public async listByStatus(status: Scheme.WebhookReportItemStatus): Promise<Array<Scheme.WebHookActionItem>> {
        return this.webHookActionItemDao.listByProjectId(status);
    }

    public async setConfirmationsAndStatus(
        id: string, confirmations: number, status: Scheme.WebhookReportItemStatus
    ): Promise<void> {
        return this.webHookActionItemDao.setConfirmationsAndStatus(id, confirmations, status);
    }

    public async setStatus(id: string, status: Scheme.WebhookReportItemStatus): Promise<void> {
        return this.webHookActionItemDao.setStatus(id, status);
    }

    public async addFailReport(id: string, fail: Scheme.WebHookFailedReport): Promise<void> {
        return this.webHookActionItemDao.addFailReport(id, fail);
    }
}
