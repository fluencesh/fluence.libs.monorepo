import {Dao, Hashtable} from '@applicature/synth.plugin-manager';
import { Scheme } from '../types';

export abstract class WebhookActionDao extends Dao<Scheme.WebhookActionItem> {
    public abstract async createAction(
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
    ): Promise<Scheme.WebhookActionItem>;

    public abstract async getById(id: string): Promise<Scheme.WebhookActionItem>;
    public abstract getByUniqueInfo(
        blockHash: string,
        blockHeight: number,
        type: Scheme.WebhookTriggerType,
        refId: string,
        eventId: string
    ): Promise<Scheme.WebhookActionItem>;

    public abstract async listByClientId(clientId: string): Promise<Array<Scheme.WebhookActionItem>>;
    public abstract async listByProjectId(projectId: string): Promise<Array<Scheme.WebhookActionItem>>;
    public abstract async listByStatus(status: Scheme.WebhookReportItemStatus)
        : Promise<Array<Scheme.WebhookActionItem>>;
    public abstract async listByStatusAndType(
        status: Scheme.WebhookReportItemStatus,
        type: Scheme.WebhookTriggerType | string
    ): Promise<Array<Scheme.WebhookActionItem>>;
    public abstract async listByStatusAndTypes(
        status: Scheme.WebhookReportItemStatus,
        types: Array<Scheme.WebhookTriggerType | string>
    ): Promise<Array<Scheme.WebhookActionItem>>;

    public abstract async setConfirmationsAndStatus(
        id: string, confirmations: number, status: Scheme.WebhookReportItemStatus
    ): Promise<void>;

    public abstract async setStatus(id: string, status: Scheme.WebhookReportItemStatus): Promise<void>;

    public abstract async addFailReport(id: string, fail: Scheme.WebhookFailedReport): Promise<void>;
}
