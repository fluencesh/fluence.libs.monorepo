import { MongoDBDao } from '@fluencesh/multivest.mongodb';
import { DaoCollectionNames, DaoIds } from '../../constants';
import { Scheme } from '../../types';
import { SubscriptionBlockRecheckDao } from '../subscription.block.recheck';

export class MongodbSubscriptionBlockRecheckDao
        extends MongoDBDao<Scheme.SubscriptionBlockRecheck>
        implements SubscriptionBlockRecheckDao
{
    public getDaoId() {
        return DaoIds.SubscriptionBlockRecheck;
    }

    public getCollectionName() {
        return DaoCollectionNames.SubscriptionBlockRecheck;
    }

    public getDefaultValue() {
        return {} as Scheme.SubscriptionBlockRecheck;
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
        return this.create({
            subscriptionId,
            blockchainId,
            networkId,
            type,
            blockHash,
            blockHeight,
            invokeOnBlockHeight,
            webhookActionItem
        });
    }

    public async getById(id: string): Promise<Scheme.SubscriptionBlockRecheck> {
        return this.getRaw({ id });
    }

    public async listByBlockHeight(height: number): Promise<Array<Scheme.SubscriptionBlockRecheck>> {
        return this.list({ blockHeight: height });
    }

    public async listByBlockHeightAndBlockchainIdAndNetworkId(
        height: number,
        blockchainId: string,
        networkId: string
    ) {
        return this.listRaw({
            blockHeight: height,
            blockchainId,
            networkId
        });
    }

    public async listByBlockHeightAndBlockchainInfoAndType(
        height: number,
        blockchainId: string,
        networkId: string,
        type: Scheme.SubscriptionBlockRecheckType
    ) {
        return this.listRaw({
            blockHeight: height,
            blockchainId,
            networkId,
            type,
        });
    }

    public async incInvokeOnBlockHeightById(id: string, incrementOn: number = 1): Promise<void> {
        await this.updateRaw({ id }, {
            $inc: {
                invokeOnBlockHeight: incrementOn
            }
        });

        return;
    }

    public async incInvokeOnBlockHeightByIds(ids: Array<string>, incrementOn: number = 1): Promise<void> {
        await this.updateRaw(
            {
                id: {
                    $in: ids,
                }
            }, {
                $inc: {
                    invokeOnBlockHeight: incrementOn,
                }
            }
        );

        return;
    }

    public async setInvokeOnBlockHeightById(id: string, invokeOnBlockHeight: number): Promise<void> {
        await this.updateRaw({ id }, {
            $set: {
                invokeOnBlockHeight,
            }
        });

        return;
    }

    public async removeById(id: string): Promise<void> {
        await this.removeRaw({ id });

        return;
    }

    public async removeByIds(ids: Array<string>): Promise<void> {
        await this.removeRaw({
            id: {
                $in: ids
            }
        });

        return;
    }
}
