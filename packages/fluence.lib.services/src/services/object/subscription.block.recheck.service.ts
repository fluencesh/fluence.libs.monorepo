import { Plugin } from '@applicature/synth.mongodb';
import { Service, MultivestError } from '@applicature/synth.plugin-manager';
import { DaoIds } from '../../constants';
import { SubscriptionBlockRecheckDao } from '../../dao';
import { Scheme } from '../../types';
import { Errors } from '../../errors';

export class SubscriptionBlockRecheckService extends Service {
    private dao: SubscriptionBlockRecheckDao;

    public async init() {
        await super.init();

        const mongoPlugin = this.pluginManager.get('mongodb') as any as Plugin;
        this.dao = await mongoPlugin.getDao(DaoIds.SubscriptionBlockRecheck) as SubscriptionBlockRecheckDao;
    }

    public getServiceId() {
        return 'subscription.blockchain.recheck.service';
    }

    public async createBlockRecheck(
        subscriptionId: string,
        transportConnectionId: string,
        type: Scheme.SubscriptionBlockRecheckType,
        blockHash: string,
        blockHeight: number,
        invokeOnBlockHeight: number,
        webhookActionItem: Scheme.WebhookActionItem
    ): Promise<Scheme.SubscriptionBlockRecheck> {
        const createdItem = await this.getByUniqueInfo(
            subscriptionId,
            transportConnectionId,
            type,
            blockHash,
            blockHeight
        );

        if (createdItem) {
            throw new MultivestError(Errors.BLOCK_RECHECK_ALREADY_EXISTS);
        }

        return this.dao.createBlockRecheck(
            subscriptionId,
            transportConnectionId,
            type,
            blockHash,
            blockHeight,
            invokeOnBlockHeight,
            webhookActionItem
        );
    }

    public async getById(id: string): Promise<Scheme.SubscriptionBlockRecheck> {
        return this.dao.getById(id);
    }

    public async getByUniqueInfo(
        subscriptionId: string,
        transportConnectionId: string,
        type: Scheme.SubscriptionBlockRecheckType,
        blockHash: string,
        blockHeight: number
    ): Promise<Scheme.SubscriptionBlockRecheck> {
        return this.dao.getByUniqueInfo(
            subscriptionId,
            transportConnectionId,
            type,
            blockHash,
            blockHeight
        );
    }

    public async listByBlockHeight(height: number): Promise<Array<Scheme.SubscriptionBlockRecheck>> {
        return this.dao.listByBlockHeight(height);
    }

    public async listByBlockHeightAndTransportConnectionId(
        height: number,
        transportConnectionId: string
    ): Promise<Array<Scheme.SubscriptionBlockRecheck>> {
        return this.dao.listByBlockHeightAndTransportConnectionId(
            height,
            transportConnectionId
        );
    }

    public async listByBlockHeightAndBlockchainInfoAndType(
        height: number,
        transportConnectionId: string,
        type: Scheme.SubscriptionBlockRecheckType
    ): Promise<Array<Scheme.SubscriptionBlockRecheck>> {
        return this.dao.listByBlockHeightAndTransportConnectionIdAndType(
            height,
            transportConnectionId,
            type
        );
    }

    public async listOnBlockByTransportAndType(
        invokeOnBlockHeight: number,
        transportConnectionId: string,
        type: Scheme.SubscriptionBlockRecheckType
    ): Promise<Array<Scheme.SubscriptionBlockRecheck>> {
        return this.dao.listOnBlockByTransportAndType(
            invokeOnBlockHeight,
            transportConnectionId,
            type
        );
    }

    public async incInvokeOnBlockHeightById(
        id: string,
        incrementOn: number = 1
    ): Promise<void> {
        await this.dao.incInvokeOnBlockHeightById(
            id,
            incrementOn
        );
    }

    public async incInvokeOnBlockHeightByIds(
        ids: Array<string>,
        incrementOn: number = 1
    ): Promise<void> {
        await this.dao.incInvokeOnBlockHeightByIds(
            ids,
            incrementOn
        );
    }

    public async setInvokeOnBlockHeightById(
        id: string,
        invokeOnBlockHeight: number
    ): Promise<void> {
        await this.dao.setInvokeOnBlockHeightById(
            id,
            invokeOnBlockHeight
        );
    }

    public async removeById(id: string): Promise<void> {
        await this.dao.removeById(id);
    }

    public async removeByIds(ids: Array<string>): Promise<void> {
        await this.dao.removeByIds(ids);
    }
}
