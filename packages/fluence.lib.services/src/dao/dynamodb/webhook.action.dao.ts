import { DynamoDBDao } from '@applicature-private/core.dynamodb';
import { Hashtable } from '@applicature-private/core.plugin-manager';
import { DaoCollectionNames, DaoIds } from '../../constants';
import { Scheme } from '../../types';
import { WebhookActionDao } from '../webhook.action.dao';

export class DynamodbWebhookActionDao extends DynamoDBDao<Scheme.WebhookActionItem> implements WebhookActionDao {
    public getDaoId() {
        return DaoIds.WebhookAction;
    }

    public getCollectionName() {
        return DaoCollectionNames.WebhookAction;
    }

    public getDefaultValue() {
        return {} as Scheme.WebhookActionItem;
    }

    public async createAction(
        clientId: string,
        projectId: string,
        blockchainId: string,
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
        return this.create({
            clientId,
            projectId,

            blockchainId,
            networkId,

            blockHash,
            blockHeight,
            blockTime,

            minConfirmations,
            confirmations,

            txHash,

            address,

            type,
            refId, // AddressSubscription id or EthereumContractSubscription id

            eventId,
            params,

            createdAt: new Date()
        });
    }

    public async getById(id: string): Promise<Scheme.WebhookActionItem> {
        return await this.get({ id });
    }

    public async getByUniqueInfo(
        blockHash: string,
        blockHeight: number,
        type: Scheme.WebhookTriggerType,
        refId: string,
        eventId: string
    ): Promise<Scheme.WebhookActionItem> {
        return await this.get({
            blockHash,
            blockHeight,
            type,
            refId,
            eventId
        });
    }

    public async listByClientId(clientId: string): Promise<Array<Scheme.WebhookActionItem>> {
        return await this.list({
            clientId
        });
    }

    public async listByProjectId(projectId: string): Promise<Array<Scheme.WebhookActionItem>> {
        return await this.list({
            projectId
        });
    }

    public async listByStatus(status: Scheme.WebhookReportItemStatus): Promise<Array<Scheme.WebhookActionItem>> {
        return await this.list({
            status
        });
    }

    public async listByStatusAndType(
        status: Scheme.WebhookReportItemStatus,
        type: Scheme.WebhookTriggerType
    ): Promise<Array<Scheme.WebhookActionItem>> {
        return await this.list({
            status,
            type
        });
    }

    public async setConfirmationsAndStatus(
        id: string,
        confirmations: number,
        status: Scheme.WebhookReportItemStatus
    ): Promise<void> {
        return await this.update({ id, confirmations, status });
    }

    public async setStatus(id: string, status: Scheme.WebhookReportItemStatus): Promise<void> {
        return await this.update({ id, status });
    }

    public async addFailReport(id: string, fail: Scheme.WebhookFailedReport): Promise<void> {
        // @TODO: make implementation
    }

    public listByStatusAndTypes(status: Scheme.WebhookReportItemStatus, types: Array<Scheme.WebhookTriggerType>): any {
        // @TODO: make implementation
    }

    public getMapperClass() {
        // @TODO: make implementation
    }

    public getMapper() {
        // @TODO: make implementation
    }
}
