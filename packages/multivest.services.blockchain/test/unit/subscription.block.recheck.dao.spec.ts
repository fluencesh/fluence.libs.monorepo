import { MongodbSubscriptionBlockRecheckDao } from '../../src';
import { randomClient, randomSubscriptionBlockChecker } from '../helper';
import { CollectionMock, DbMock } from '../mock/db.mock';

describe('subscription block recheck dao', () => {
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

    it('listByBlockHeight() transfers correct arguments', async () => {
        const blockHeight = 1;
        await dao.listByBlockHeight(blockHeight);

        expect(collection.find).toHaveBeenCalledWith({ blockHeight });
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('listByBlockHeightAndBlockchainIdAndNetworkId() transfers correct arguments', async () => {
        const blockHeight = 1;
        const blockchainId = 'blockchainId';
        const networkId = 'networkId';
        await dao.listByBlockHeightAndBlockchainIdAndNetworkId(
            blockHeight,
            blockchainId,
            networkId
        );

        expect(collection.find).toHaveBeenCalledWith({
            blockHeight,
            blockchainId,
            networkId,
        });
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('listByBlockHeightAndBlockchainInfoAndType() transfers correct arguments', async () => {
        const blockHeight = 1;
        const blockchainId = 'blockchainId';
        const networkId = 'networkId';
        const type = 'type' as any;

        await dao.listByBlockHeightAndBlockchainInfoAndType(
            blockHeight,
            blockchainId,
            networkId,
            type
        );

        expect(collection.find).toHaveBeenCalledWith({
            blockHeight,
            blockchainId,
            networkId,
            type,
        });
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('createBlockRecheck() transfers correct arguments', async () => {
        const data = randomSubscriptionBlockChecker();
        await dao.createBlockRecheck(
            data.subscriptionId,
            data.blockchainId,
            data.networkId,
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
