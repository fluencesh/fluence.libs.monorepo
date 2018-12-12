import { MongodbSubscriptionBlockRecheckDao } from '../../src';
import { generateSubscriptionBlockRecheck } from '../helpers';
import { CollectionMock, DbMock } from '../mock/db.mock';

describe('Subscription Block Recheck DAO (unit)', () => {
    let dao: MongodbSubscriptionBlockRecheckDao;
    let collection: any;

    beforeAll(async () => {
        dao = new MongodbSubscriptionBlockRecheckDao(DbMock);
        collection = CollectionMock as any;
    });

    beforeEach(() => {
        Object.keys(collection).forEach((key) => {
            const spy = collection[key] as jest.SpyInstance;
            spy.mockClear();
        });
    });

    it('getById() transfers correct arguments', async () => {
        await dao.getById('id');

        expect(collection.findOne).toHaveBeenCalledWith({ id: 'id' });
        expect(collection.findOne).toHaveBeenCalledTimes(1);
    });

    it('getById() transfers correct arguments', async () => {
        const subscriptionId = 'subscriptionId';
        const transportConnectionId = 'transportConnectionId';
        const type: any = 'type';
        const blockHash = 'blockHash';
        const blockHeight = 1;

        await dao.getByUniqueInfo(subscriptionId, transportConnectionId, type, blockHash, blockHeight);

        expect(collection.findOne).toHaveBeenCalledWith({
            subscriptionId,
            transportConnectionId,
            type,
            blockHash,
            blockHeight
        });
        expect(collection.findOne).toHaveBeenCalledTimes(1);
    });

    it('listByBlockHeight() transfers correct arguments', async () => {
        const blockHeight = 1;
        await dao.listByBlockHeight(blockHeight);

        expect(collection.find).toHaveBeenCalledWith({ blockHeight });
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('listByBlockHeightAndBlockchainIdAndNetworkId() transfers correct arguments', async () => {
        const blockHeight = 1;
        const transportConnectionId = 'transportConnectionId';
        await dao.listByBlockHeightAndTransportConnectionId(
            blockHeight,
            transportConnectionId
        );

        expect(collection.find).toHaveBeenCalledWith({
            blockHeight,
            transportConnectionId
        });
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('listByBlockHeightAndBlockchainInfoAndType() transfers correct arguments', async () => {
        const blockHeight = 1;
        const transportConnectionId = 'transportConnectionId';
        const type = 'type' as any;

        await dao.listByBlockHeightAndTransportConnectionIdAndType(
            blockHeight,
            transportConnectionId,
            type
        );

        expect(collection.find).toHaveBeenCalledWith({
            blockHeight,
            transportConnectionId,
            type,
        });
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('listByLteInvokeOnBlockAndTransportConnectionIdAndType() transfers correct arguments', async () => {
        const invokeOnBlockHeight = 1;
        const transportConnectionId = 'transportConnectionId';
        const type = 'type' as any;

        await dao.listOnBlockByTransportAndType(
            invokeOnBlockHeight,
            transportConnectionId,
            type
        );

        expect(collection.find).toHaveBeenCalledWith({
            invokeOnBlockHeight: {
                $lte: invokeOnBlockHeight
            },
            transportConnectionId,
            type,
        });
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('createBlockRecheck() transfers correct arguments', async () => {
        const data = generateSubscriptionBlockRecheck();
        await dao.createBlockRecheck(
            data.subscriptionId,
            data.transportConnectionId,
            data.type,
            data.blockHash,
            data.blockHeight,
            data.invokeOnBlockHeight,
            data.webhookActionItem
        );

        expect(collection.insertOne).toHaveBeenCalledTimes(1);
    });

    it('incInvokeOnBlockHeightById() transfers correct arguments', async () => {
        const id = 'id';
        await dao.incInvokeOnBlockHeightById(id);

        expect(collection.updateMany).toHaveBeenCalledWith({ id }, {
            $inc: {
                invokeOnBlockHeight: 1
            }
        });
        expect(collection.updateMany).toHaveBeenCalledTimes(1);
    });

    it('incInvokeOnBlockHeightById() transfers correct arguments (another one)', async () => {
        const id = 'id';
        const incrementOn = 5;
        await dao.incInvokeOnBlockHeightById(id, incrementOn);

        expect(collection.updateMany).toHaveBeenCalledWith({ id }, {
            $inc: {
                invokeOnBlockHeight: incrementOn
            }
        });
        expect(collection.updateMany).toHaveBeenCalledTimes(1);
    });

    it('incInvokeOnBlockHeightByIds() transfers correct arguments', async () => {
        const ids = [ 'id' ];
        await dao.incInvokeOnBlockHeightByIds(ids);

        expect(collection.updateMany).toHaveBeenCalledWith(
            {
                id: {
                    $in: ids
                }
            }, {
                $inc: {
                    invokeOnBlockHeight: 1
                }
            }
        );
        expect(collection.updateMany).toHaveBeenCalledTimes(1);
    });

    it('incInvokeOnBlockHeightByIds() transfers correct arguments (another one)', async () => {
        const ids = [ 'id' ];
        const incrementOn = 5;
        await dao.incInvokeOnBlockHeightByIds(ids, incrementOn);

        expect(collection.updateMany).toHaveBeenCalledWith(
            {
                id: {
                    $in: ids
                }
            }, {
                $inc: {
                    invokeOnBlockHeight: incrementOn
                }
            }
        );
        expect(collection.updateMany).toHaveBeenCalledTimes(1);
    });

    it('setInvokeOnBlockHeightById() transfers correct arguments (another one)', async () => {
        const id = 'id';
        const invokeOnBlockHeight = 1;
        await dao.setInvokeOnBlockHeightById(id, invokeOnBlockHeight);

        expect(collection.updateMany).toHaveBeenCalledWith({ id }, { $set: { invokeOnBlockHeight } });
        expect(collection.updateMany).toHaveBeenCalledTimes(1);
    });

    it('removeById() transfers correct arguments', async () => {
        const id = 'id';
        await dao.removeById(id);

        expect(collection.deleteMany).toHaveBeenCalledWith({ id });
        expect(collection.deleteMany).toHaveBeenCalledTimes(1);
    });

    it('removeById() transfers correct arguments', async () => {
        const ids = ['id'];
        await dao.removeByIds(ids);

        expect(collection.deleteMany).toHaveBeenCalledWith({ id: { $in: ids } });
        expect(collection.deleteMany).toHaveBeenCalledTimes(1);
    });
});
