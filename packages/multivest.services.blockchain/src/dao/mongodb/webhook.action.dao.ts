import { MongoDBDao } from '@applicature/multivest.mongodb';
import { Scheme } from '../../types';
import { ProjectDao } from '../project.dao';
import {WebHookActionDao} from '../webhook.action.dao';
import {Hashtable} from '@applicature/multivest.core';

export class MongodbWebHookActionDao extends MongoDBDao<Scheme.WebHookActionItem> implements WebHookActionDao {
    public getDaoId() {
        return 'webhooks';
    }

    public getCollectionName() {
        return 'webhooks';
    }

    public getDefaultValue() {
        return {} as Scheme.WebHookActionItem;
    }

    public  async createAction(
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
        return this.create({
            clientId,
            projectId,

            blockChainId,
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

    public async getById(id: string): Promise<Scheme.WebHookActionItem> {
        return this.get({ id });
    }

    public async listByClientId(clientId: string): Promise<Array<Scheme.WebHookActionItem>> {
        return this.listRaw({
            clientId
        });
    }

    public async listByProjectId(projectId: string): Promise<Array<Scheme.WebHookActionItem>> {
        return this.listRaw({
            projectId
        });
    }

    public async setConfirmationsAndStatus(
        id: string, confirmations: number, status: Scheme.WebhookReportItemStatus
    ): Promise<void> {
        await this.updateRaw({ id }, {
            $set: {
                confirmations,
                status
            }
        });

        return;
    }

    public async setStatus(id: string, status: Scheme.WebhookReportItemStatus): Promise<void> {
        await this.updateRaw({ id }, {
            $set: {
                status
            }
        });

        return;
    }

    public async addFailReport(id: string, fail: Scheme.WebHookFailedReport): Promise<void> {
        await this.updateRaw({ id }, {
            $addToSet: {
                fails: fail
            },
            $set: {
                failedCount: {
                    $inc: 1
                },
                status: Scheme.WebhookReportItemStatus.Failed,
                lastFailedAt: new Date()
            }
        });

        return;
    }
}
