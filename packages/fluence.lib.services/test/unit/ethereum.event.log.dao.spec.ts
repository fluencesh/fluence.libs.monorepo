import { MongodbEthereumEventLogDao } from '../../src/dao/mongodb/ethereum.event.log.dao';
import { generateEthereumEventLog } from '../helpers';
import { CollectionMock, DbMock } from '../mock/db.mock';

describe('Ethereum Event Log DAO (unit)', () => {
    let dao: MongodbEthereumEventLogDao;
    let collection: any;

    beforeAll(async () => {
        dao = new MongodbEthereumEventLogDao(DbMock);
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

    it('listByIds() transfers correct arguments', async () => {
       await dao.listByIds(['id1', 'id2']);

       expect(collection.find).toHaveBeenCalledWith({ id: { $in: [ 'id1', 'id2' ] } });
       expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('createEvent() transfers correct arguments', async () => {
        const data = generateEthereumEventLog();

        await dao.createEvent(
            data.blockChainId,
            data.networkId,
            data.blockHash,
            data.blockHeight,
            data.blockTime,
            data.txHash,
            data.address,
            data.event,
            data.eventHash,
            data.params
        );

        expect(collection.insertOne).toHaveBeenCalledTimes(1);
    });
});
