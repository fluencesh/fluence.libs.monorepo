import { attribute, hashKey, table } from '@aws/dynamodb-data-mapper-annotations';

@table('Dao')
export class WebhookDaoActionItem {
    @hashKey()
    public clientId: string;
    @attribute()
    public projectId?: string;
    @attribute()
    public blockchainId?: string;
    @attribute()
    public networkId?: string;
    @attribute()
    public blockHash?: string;
    @attribute()
    public blockHeight?: number;
    @attribute()
    public blockTime?: number;
    @attribute()
    public minConfirmations?: number;
    @attribute()
    public confirmations?: number;
    @attribute()
    public txHash?: string;
    @attribute()
    public address?: string;
    @attribute()
    public type?: string;
    @attribute()
    public refId?: string;
    @attribute()
    public eventId?: string;
    @attribute()
    public params?: object;
}
