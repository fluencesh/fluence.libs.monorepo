import { MongoDBDao } from '@applicature/synth.mongodb';
import { Hashtable } from '@applicature/synth.plugin-manager';
import { DaoCollectionNames, DaoIds } from '../../constants';
import { Scheme } from '../../types';
import { WebhookActionDao } from '../webhook.action.dao';

export class MongodbWebhookActionDao extends MongoDBDao<Scheme.WebhookActionItem> implements WebhookActionDao {
    public getDaoId() {
        return DaoIds.WebhookAction;
    }

    public getCollectionName() {
        return DaoCollectionNames.WebhookAction;
    }

    public getDefaultValue() {
        return {} as Scheme.WebhookActionItem;
    }

    public  async createAction(
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
        return this.get({ id });
    }

    public async getByUniqueInfo(
        blockHash: string,
        blockHeight: number,
        type: Scheme.WebhookTriggerType,
        refId: string,
        eventId: string
    ): Promise<Scheme.WebhookActionItem> {
        return this.getRaw({
            blockHash,
            blockHeight,
            type,
            refId,
            eventId
        });
    }

    public async listByClientId(clientId: string): Promise<Array<Scheme.WebhookActionItem>> {
        return this.listRaw({
            clientId
        });
    }

    public async listByProjectId(projectId: string): Promise<Array<Scheme.WebhookActionItem>> {
        return this.listRaw({
            projectId
        });
    }

    public async listByStatus(status: Scheme.WebhookReportItemStatus): Promise<Array<Scheme.WebhookActionItem>> {
        return this.listRaw({
            status
        });
    }

    public async listByStatusAndType(
        status: Scheme.WebhookReportItemStatus,
        type: Scheme.WebhookTriggerType
    ): Promise<Array<Scheme.WebhookActionItem>> {
        return this.listRaw({
            status,
            type
        });
    }

    public async listByStatusAndTypes(
        status: Scheme.WebhookReportItemStatus,
        types: Array<Scheme.WebhookTriggerType>
    ): Promise<Array<Scheme.WebhookActionItem>> {
        return this.listRaw({
            status,
            type: { $in: types }
        });
    }

    public async setConfirmationsAndStatus(
        id: string,
        confirmations: number, status: Scheme.WebhookReportItemStatus
    ): Promise<void> {
        await this.updateRaw({ id }, {
            $set: {
                confirmations,
                status
            }
        });
    }

    public async setStatus(id: string, status: Scheme.WebhookReportItemStatus): Promise<void> {
        await this.updateRaw({ id }, {
            $set: {
                status
            }
        });
    }

    public async addFailReport(id: string, fail: Scheme.WebhookFailedReport): Promise<void> {
        await this.updateRaw({ id }, {
            $push: {
                fails: fail,
            },
            $inc: {
                failedCount: 1,
            },
            $set: {
                status: 'FAILED',
                lastFailedAt: new Date(),
            }
        });
    }
}
