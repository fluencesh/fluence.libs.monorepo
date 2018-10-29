import { Plugin } from '@applicature/core.mongodb';
import { Service } from '@applicature/core.plugin-manager';
import { DaoIds } from '../../constants';
import { SubscriptionBlockRecheckDao } from '../../dao';
import { Scheme } from '../../types';

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
        blockchainId: string,
        networkId: string,
        type: Scheme.SubscriptionBlockRecheckType,
        blockHash: string,
        blockHeight: number,
        invokeOnBlockHeight: number,
        webhookActionItem: Scheme.WebhookActionItem
    ): Promise<Scheme.SubscriptionBlockRecheck> {
        return this.dao.createBlockRecheck(
            subscriptionId,
            blockchainId,
            networkId,
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

    public async listByBlockHeight(height: number): Promise<Array<Scheme.SubscriptionBlockRecheck>> {
        return this.dao.listByBlockHeight(height);
    }

    public async listByBlockHeightAndBlockchainIdAndNetworkId(
        height: number,
        blockchainId: string,
        networkId: string
    ): Promise<Array<Scheme.SubscriptionBlockRecheck>> {
        return this.dao.listByBlockHeightAndBlockchainIdAndNetworkId(
            height,
            blockchainId,
            networkId
        );
    }

    public async listByBlockHeightAndBlockchainInfoAndType(
        height: number,
        blockchainId: string,
        networkId: string,
        type: Scheme.SubscriptionBlockRecheckType
    ): Promise<Array<Scheme.SubscriptionBlockRecheck>> {
        return this.dao.listByBlockHeightAndBlockchainInfoAndType(
            height,
            blockchainId,
            networkId,
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