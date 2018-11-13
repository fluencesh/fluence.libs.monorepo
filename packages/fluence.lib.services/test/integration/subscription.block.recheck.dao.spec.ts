import { random } from 'lodash';
import { MongodbSubscriptionBlockRecheckDao, Scheme } from '../../src';
import { createDao, createEntities, getRandomItem, randomSubscriptionBlockChecker } from '../helper';

describe('subscription block recheck dao', () => {
    let dao: MongodbSubscriptionBlockRecheckDao;

    const subscriptionBlockRechecks: Array<Scheme.SubscriptionBlockRecheck> = new Array(15);
    let subscriptionBlockRecheck: Scheme.SubscriptionBlockRecheck = null;

    beforeAll(async () => {
        dao = await createDao(MongodbSubscriptionBlockRecheckDao);
        await createEntities(dao, randomSubscriptionBlockChecker, subscriptionBlockRechecks);
    });

    beforeEach(() => {
        subscriptionBlockRecheck = getRandomItem(subscriptionBlockRechecks);
    });

    it('should get by id', async () => {
        const got = await dao.getById(subscriptionBlockRecheck.id);
        expect(got).toEqual(subscriptionBlockRecheck);
    });

    it('should get by block height', async () => {
        const filtered =
            subscriptionBlockRechecks.filter((sbr) => sbr.blockHeight === subscriptionBlockRecheck.blockHeight);

        const got = await dao.listByBlockHeight(subscriptionBlockRecheck.blockHeight);
        expect(got).toEqual(filtered);
    });

    it('should get by block height and transportConnectionId', async () => {
        const filtered = subscriptionBlockRechecks.filter((sbr) =>
            sbr.blockHeight === subscriptionBlockRecheck.blockHeight
            && sbr.transportConnectionId === subscriptionBlockRecheck.transportConnectionId
        );

        const got = await dao.listByBlockHeightAndTransportConnectionId(
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

        const got = await dao.listByBlockHeightAndTransportConnectionIdAndType(
            subscriptionBlockRecheck.blockHeight,
            subscriptionBlockRecheck.transportConnectionId,
            subscriptionBlockRecheck.type
        );
        expect(got).toEqual(filtered);
    });

    it('should get by invokeOnBlockHeight and transportConnectionId and type', async () => {
        const filtered = subscriptionBlockRechecks.filter((sbr) =>
            sbr.invokeOnBlockHeight <= subscriptionBlockRecheck.invokeOnBlockHeight
            && sbr.transportConnectionId === subscriptionBlockRecheck.transportConnectionId
            && sbr.type === subscriptionBlockRecheck.type
        );

        const got = await dao.listByLteInvokeOnBlockAndTransportConnectionIdAndType(
            subscriptionBlockRecheck.invokeOnBlockHeight,
            subscriptionBlockRecheck.transportConnectionId,
            subscriptionBlockRecheck.type
        );
        expect(got).toEqual(filtered);
    });

    it('should create new entity', async () => {
        const data = randomSubscriptionBlockChecker();
        const got = await dao.createBlockRecheck(
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
        await dao.incInvokeOnBlockHeightById(subscriptionBlockRecheck.id);

        const got = await dao.getById(subscriptionBlockRecheck.id);
        expect(got.invokeOnBlockHeight).toEqual(subscriptionBlockRecheck.invokeOnBlockHeight + 1);

        subscriptionBlockRecheck.invokeOnBlockHeight += 1;
    });

    it('should increment `invokeOnBlockHeight` by id (another one)', async () => {
        const incrementOn = random(2, 10);
        await dao.incInvokeOnBlockHeightById(subscriptionBlockRecheck.id, incrementOn);

        const got = await dao.getById(subscriptionBlockRecheck.id);
        expect(got.invokeOnBlockHeight).toEqual(subscriptionBlockRecheck.invokeOnBlockHeight + incrementOn);

        subscriptionBlockRecheck.invokeOnBlockHeight += incrementOn;
    });

    it('should increment `invokeOnBlockHeight` by ids', async () => {
        await dao.incInvokeOnBlockHeightByIds([ subscriptionBlockRecheck.id ]);

        const got = await dao.getById(subscriptionBlockRecheck.id);
        expect(got.invokeOnBlockHeight).toEqual(subscriptionBlockRecheck.invokeOnBlockHeight + 1);

        subscriptionBlockRecheck.invokeOnBlockHeight += 1;
    });

    it('should increment `invokeOnBlockHeight` by ids (another one)', async () => {
        const incrementOn = random(2, 10);
        await dao.incInvokeOnBlockHeightByIds([ subscriptionBlockRecheck.id ], incrementOn);

        const got = await dao.getById(subscriptionBlockRecheck.id);
        expect(got.invokeOnBlockHeight).toEqual(subscriptionBlockRecheck.invokeOnBlockHeight + incrementOn);

        subscriptionBlockRecheck.invokeOnBlockHeight += incrementOn;
    });

    it('should set new `invokeOnBlockHeight` by id', async () => {
        const invokeOnBlockHeight = random(500000, 1000000);
        await dao.setInvokeOnBlockHeightById(subscriptionBlockRecheck.id, invokeOnBlockHeight);

        const got = await dao.getById(subscriptionBlockRecheck.id);
        expect(got.invokeOnBlockHeight).toEqual(invokeOnBlockHeight);

        subscriptionBlockRecheck.invokeOnBlockHeight = invokeOnBlockHeight;
    });

    it('should remove by id', async () => {
        await dao.removeById(subscriptionBlockRecheck.id);

        const got = await dao.getById(subscriptionBlockRecheck.id);
        expect(got).toBeNull();

        subscriptionBlockRechecks.splice(
            subscriptionBlockRechecks.indexOf(subscriptionBlockRecheck), 1
        );
    });

    it('should remove by ids', async () => {
        await dao.removeByIds([ subscriptionBlockRecheck.id ]);

        const got = await dao.getById(subscriptionBlockRecheck.id);
        expect(got).toBeNull();

        subscriptionBlockRechecks.splice(
            subscriptionBlockRechecks.indexOf(subscriptionBlockRecheck), 1
        );
    });
});
