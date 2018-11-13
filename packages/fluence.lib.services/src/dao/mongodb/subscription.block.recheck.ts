import { MongoDBDao } from '@applicature-private/core.mongodb';
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
        transportConnectionId: string,
        type: Scheme.SubscriptionBlockRecheckType,
        blockHash: string,
        blockHeight: number,
        invokeOnBlockHeight: number,
        webhookActionItem: Scheme.WebhookActionItem
    ): Promise<Scheme.SubscriptionBlockRecheck> {
        return this.create({
            subscriptionId,
            transportConnectionId,
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

    public async listByBlockHeightAndTransportConnectionId(
        height: number,
        transportConnectionId: string
    ) {
        return this.listRaw({
            blockHeight: height,
            transportConnectionId
        });
    }

    public async listByBlockHeightAndTransportConnectionIdAndType(
        height: number,
        transportConnectionId: string,
        type: Scheme.SubscriptionBlockRecheckType
    ) {
        return this.listRaw({
            blockHeight: height,
            transportConnectionId,
            type,
        });
    }

    public async listByLteInvokeOnBlockAndTransportConnectionIdAndType(
        invokeOnBlockHeight: number,
        transportConnectionId: string,
        type: Scheme.SubscriptionBlockRecheckType
    ): Promise<Array<Scheme.SubscriptionBlockRecheck>> {
        return this.listRaw({
            invokeOnBlockHeight: {
                $lte: invokeOnBlockHeight
            },
            transportConnectionId,
            type
        });
    }

    public async incInvokeOnBlockHeightById(id: string, incrementOn: number = 1): Promise<void> {
        await this.updateRaw({ id }, {
            $inc: {
                invokeOnBlockHeight: incrementOn
            }
        });
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
    }

    public async setInvokeOnBlockHeightById(id: string, invokeOnBlockHeight: number): Promise<void> {
        await this.updateRaw({ id }, {
            $set: {
                invokeOnBlockHeight,
            }
        });
    }

    public async removeById(id: string): Promise<void> {
        await this.removeRaw({ id });
    }

    public async removeByIds(ids: Array<string>): Promise<void> {
        await this.removeRaw({
            id: {
                $in: ids
            }
        });
    }
}
