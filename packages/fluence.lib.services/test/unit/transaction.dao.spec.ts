import { MongodbTransactionDao } from '../../src/dao/mongodb/transaction.dao';
import { Scheme } from '../../src/types';
import { CollectionMock, DbMock } from '../mock/db.mock';

describe('TransactionDao', () => {
    let dao: MongodbTransactionDao;
    let collection: any;

    beforeAll(async () => {
        dao = new MongodbTransactionDao(DbMock);
        collection = CollectionMock as any;
    });

    beforeEach(() => {
        Object.keys(collection).forEach((key) => {
            const spy = collection[key] as jest.SpyInstance;
            spy.mockClear();
        });
    });

    it('getByUniqId() transfers correct arguments', async () => {
        await dao.getByUniqId('uniq');
        expect(collection.findOne).toHaveBeenCalledWith({ uniqId: 'uniq' });
        expect(collection.findOne).toHaveBeenCalledTimes(1);
    });

    it('getByHash() transfers correct arguments', async () => {
        await dao.getByHash('hash');
        expect(collection.findOne).toHaveBeenCalledWith({ 'ref.hash': 'hash' });
        expect(collection.findOne).toHaveBeenCalledTimes(1);
    });

    it('listByNetworkAndStatus() transfers correct arguments', async () => {
        await dao.listByNetworkAndStatus('bitcoin', 'testnet', Scheme.TransactionStatus.Mined);
        expect(collection.find).toHaveBeenCalledWith({
            blockChainId: 'bitcoin',
            networkId: 'testnet',
            status: Scheme.TransactionStatus.Mined,
        });
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('listByUniqId() transfers correct arguments', async () => {
        await dao.listByUniqId('bitcoin', 'testnet', 'uniq');
        expect(collection.find).toHaveBeenCalledWith({
            blockChainId: 'bitcoin',
            networkId: 'testnet',
            uniqId: 'uniq',
        });
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('getCountByAddress() transfers correct arguments', async () => {
        await dao.getCountByAddress('bitcoin', 'testnet', 'address');
        expect(collection.count).toHaveBeenCalledWith({
            'blockChainId': 'bitcoin',
            'networkId': 'testnet',
            'ref.from': {
                $elemMatch: {
                    address: 'address',
                },
            },
        });
        expect(collection.count).toHaveBeenCalledTimes(1);
    });

    it('setHashAndStatus() transfers correct arguments', async () => {
        await dao.setHashAndStatus('0x0', 'hash', Scheme.TransactionStatus.Sent);
        expect(collection.updateOne).toHaveBeenCalledWith(
            {
                id: '0x0',
            },
            {
                $set: {
                    'ref.hash': 'hash',
                    'status': Scheme.TransactionStatus.Sent,
                },
            }
        );
        expect(collection.updateOne).toHaveBeenCalledTimes(1);
    });
});
