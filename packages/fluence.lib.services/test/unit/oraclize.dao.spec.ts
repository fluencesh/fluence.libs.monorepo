import { MongodbOraclizeSubscriptionDao } from '../../src/dao/mongodb/oraclize.subscription.dao';
import { generateOraclize } from '../helpers';
import { CollectionMock, DbMock } from '../mock/db.mock';

describe('Oraclize DAO (unit)', () => {
    let dao: MongodbOraclizeSubscriptionDao;
    let collection: any;

    beforeAll(async () => {
        dao = new MongodbOraclizeSubscriptionDao(DbMock);
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

    it('getByIdAndProjectId() transfers correct arguments', async () => {
        await dao.getByIdAndProjectId('id', 'projectId');

        expect(collection.findOne).toHaveBeenCalledWith({ id: 'id', projectId: 'projectId' });
        expect(collection.findOne).toHaveBeenCalledTimes(1);
    });

    it('listByEventHash() transfers correct arguments', async () => {
        const eventHash = 'eventHash';

        await dao.listByEventHash(eventHash);

        expect(collection.find).toHaveBeenCalledWith({ eventHash });
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('listByEventHashAndStatus() transfers correct arguments', async () => {
        const eventHash = 'eventHash';
        const subscribed = true;

        await dao.listByEventHashAndStatus(eventHash, subscribed);

        expect(collection.find).toHaveBeenCalledWith({ eventHash, subscribed });
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('listByEventHashes() transfers correct arguments', async () => {
        const eventHashes = ['eventHash'];

        await dao.listByEventHashes(eventHashes);

        expect(collection.find).toHaveBeenCalledWith({ eventHash: { $in: eventHashes } });
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('listByEventHashesAndStatus() transfers correct arguments', async () => {
        const eventHashes = ['eventHash'];
        const subscribed = true;

        await dao.listByEventHashesAndStatus(eventHashes, subscribed);

        expect(collection.find).toHaveBeenCalledWith({ eventHash: { $in: eventHashes }, subscribed });
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('listByProjectId() transfers correct arguments', async () => {
        const projectId = 'projectId';

        await dao.listByProjectId(projectId);

        expect(collection.find).toHaveBeenCalledWith({ projectId });
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('listByStatus() transfers correct arguments', async () => {
        const subscribed = true;

        await dao.listByStatus(subscribed);

        expect(collection.find).toHaveBeenCalledWith({ subscribed });
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('listByStatus() transfers correct arguments', async () => {
        const subscribed = true;
        const projectId = 'projectId';

        await dao.listByStatusAndProjectId(subscribed, projectId);

        expect(collection.find).toHaveBeenCalledWith({ subscribed, projectId });
        expect(collection.find).toHaveBeenCalledTimes(1);
    });

    it('createOraclize() transfers correct arguments', async () => {
        const randomOraclizeEntity = generateOraclize();

        await dao.createSubscription(
            randomOraclizeEntity.clientId,
            randomOraclizeEntity.projectId,
            randomOraclizeEntity.transportConnectionId,
            randomOraclizeEntity.minConfirmations,
            randomOraclizeEntity.eventHash,
            randomOraclizeEntity.eventName,
            randomOraclizeEntity.eventInputTypes,
            randomOraclizeEntity.webhookUrl
        );
        expect(collection.insertOne).toHaveBeenCalledTimes(1);
    });

    it('setStatus() transfers correct arguments', async () => {
        const id = 'id';
        const subscribed = true;

        await dao.setSubscribed(id, subscribed);

        expect(collection.updateMany).toHaveBeenCalledWith({ id }, { $set: { subscribed } });
        expect(collection.updateMany).toHaveBeenCalledTimes(1);
    });
});
