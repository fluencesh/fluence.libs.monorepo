import { random } from 'lodash';
import { MongodbSubscriptionBlockRecheckDao, Scheme, SubscriptionBlockRecheckService } from '../../src';
import { createDao, createEntities, getRandomItem, randomSubscriptionBlockChecker } from '../helper';

describe('subscription block recheck service', () => {
    let service: SubscriptionBlockRecheckService;

    const subscriptionBlockRechecks: Array<Scheme.SubscriptionBlockRecheck> = new Array(15);
    let subscriptionBlockRecheck: Scheme.SubscriptionBlockRecheck = null;

    beforeAll(async () => {
        const dao = await createDao(MongodbSubscriptionBlockRecheckDao);
        await createEntities(dao, randomSubscriptionBlockChecker, subscriptionBlockRechecks);

        service = new SubscriptionBlockRecheckService(null);
        (service as any).dao = dao;
    });

    beforeEach(() => {
        subscriptionBlockRecheck = getRandomItem(subscriptionBlockRechecks);
    });

    it('should get by id', async () => {
        const got = await service.getById(subscriptionBlockRecheck.id);
        expect(got).toEqual(subscriptionBlockRecheck);
    });

    it('should get by block height', async () => {
        const filtered =
            subscriptionBlockRechecks.filter((sbr) => sbr.blockHeight === subscriptionBlockRecheck.blockHeight);

        const got = await service.listByBlockHeight(subscriptionBlockRecheck.blockHeight);
        expect(got).toEqual(filtered);
    });

    it('should get by block height and blockchainId and networkId', async () => {
        const filtered = subscriptionBlockRechecks.filter((sbr) =>
            sbr.blockHeight === subscriptionBlockRecheck.blockHeight
            && sbr.transportConnectionId === subscriptionBlockRecheck.transportConnectionId
        );

        const got = await service.listByBlockHeightAndTransportConnectionId(
            subscriptionBlockRecheck.blockHeight,
            subscriptionBlockRecheck.transportConnectionId
        );
        expect(got).toEqual(filtered);
    });

    it('should get by block height and blockchainId and networkId', async () => {
        const filtered = subscriptionBlockRechecks.filter((sbr) =>
            sbr.blockHeight === subscriptionBlockRecheck.blockHeight
            && sbr.transportConnectionId === subscriptionBlockRecheck.transportConnectionId
            && sbr.type === subscriptionBlockRecheck.type
        );

        const got = await service.listByBlockHeightAndBlockchainInfoAndType(
            subscriptionBlockRecheck.blockHeight,
            subscriptionBlockRecheck.transportConnectionId,
            subscriptionBlockRecheck.type
        );
        expect(got).toEqual(filtered);
    });

    it('should create new entity', async () => {
        const data = randomSubscriptionBlockChecker();
        const got = await service.createBlockRecheck(
            data.subscriptionId,
            data.transportConnectionId,
            data.type,
            data.blockHash,
            data.blockHeight,
            data.invokeOnBlockHeight,
            data.webhookActionItem
        );
        
        expect(got.subscriptionId).toEqual(data.subscriptionId);
        expect(got.transportConnectionId).toEqual(data.transportConnectionId);
        expect(got.type).toEqual(data.type);
        expect(got.blockHash).toEqual(data.blockHash);
        expect(got.blockHeight).toEqual(data.blockHeight);
        expect(got.invokeOnBlockHeight).toEqual(data.invokeOnBlockHeight);
        expect(got.webhookActionItem).toEqual(data.webhookActionItem);
    });

    it('should increment `invokeOnBlockHeight` by id', async () => {
        await service.incInvokeOnBlockHeightById(subscriptionBlockRecheck.id);

        const got = await service.getById(subscriptionBlockRecheck.id);
        expect(got.invokeOnBlockHeight).toEqual(subscriptionBlockRecheck.invokeOnBlockHeight + 1);

        subscriptionBlockRecheck.invokeOnBlockHeight += 1;
    });

    it('should increment `invokeOnBlockHeight` by id (another one)', async () => {
        const incrementOn = random(2, 10);
        await service.incInvokeOnBlockHeightById(subscriptionBlockRecheck.id, incrementOn);

        const got = await service.getById(subscriptionBlockRecheck.id);
        expect(got.invokeOnBlockHeight).toEqual(subscriptionBlockRecheck.invokeOnBlockHeight + incrementOn);

        subscriptionBlockRecheck.invokeOnBlockHeight += incrementOn;
    });

    it('should increment `invokeOnBlockHeight` by ids', async () => {
        await service.incInvokeOnBlockHeightByIds([ subscriptionBlockRecheck.id ]);

        const got = await service.getById(subscriptionBlockRecheck.id);
        expect(got.invokeOnBlockHeight).toEqual(subscriptionBlockRecheck.invokeOnBlockHeight + 1);

        subscriptionBlockRecheck.invokeOnBlockHeight += 1;
    });

    it('should increment `invokeOnBlockHeight` by ids (another one)', async () => {
        const incrementOn = random(2, 10);
        await service.incInvokeOnBlockHeightByIds([ subscriptionBlockRecheck.id ], incrementOn);

        const got = await service.getById(subscriptionBlockRecheck.id);
        expect(got.invokeOnBlockHeight).toEqual(subscriptionBlockRecheck.invokeOnBlockHeight + incrementOn);

        subscriptionBlockRecheck.invokeOnBlockHeight += incrementOn;
    });

    it('should set new `invokeOnBlockHeight` by id', async () => {
        const invokeOnBlockHeight = random(500000, 1000000);
        await service.setInvokeOnBlockHeightById(subscriptionBlockRecheck.id, invokeOnBlockHeight);

        const got = await service.getById(subscriptionBlockRecheck.id);
        expect(got.invokeOnBlockHeight).toEqual(invokeOnBlockHeight);

        subscriptionBlockRecheck.invokeOnBlockHeight = invokeOnBlockHeight;
    });

    it('should remove by id', async () => {
        await service.removeById(subscriptionBlockRecheck.id);

        const got = await service.getById(subscriptionBlockRecheck.id);
        expect(got).toBeNull();

        subscriptionBlockRechecks.splice(
            subscriptionBlockRechecks.indexOf(subscriptionBlockRecheck), 1
        );
    });

    it('should remove by ids', async () => {
        await service.removeByIds([ subscriptionBlockRecheck.id ]);

        const got = await service.getById(subscriptionBlockRecheck.id);
        expect(got).toBeNull();

        subscriptionBlockRechecks.splice(
            subscriptionBlockRechecks.indexOf(subscriptionBlockRecheck), 1
        );
    });
});
