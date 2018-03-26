import {Dao, Hashtable} from '@applicature/multivest.core';
import { Scheme } from '../types';

export abstract class WebHookActionDao extends Dao<Scheme.WebHookActionItem> {
    public abstract async createAction(
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
    ): Promise<Scheme.WebHookActionItem>;

    public abstract async getById(id: string): Promise<Scheme.WebHookActionItem>;

    public abstract async listByClientId(clientId: string): Promise<Array<Scheme.WebHookActionItem>>;
    public abstract async listByProjectId(projectId: string): Promise<Array<Scheme.WebHookActionItem>>;

    public abstract async setConfirmationsAndStatus(
        id: string, confirmations: number, status: Scheme.WebhookReportItemStatus
    ): Promise<void>;

    public abstract async setStatus(id: string, status: Scheme.WebhookReportItemStatus): Promise<void>;

    public abstract async addFailReport(id: string, fail: Scheme.WebHookFailedReport): Promise<void>;
}
