import { MongodbClientDao } from '../../src/dao/mongodb/client.dao';
import { generateClient } from '../helpers';
import { CollectionMock, DbMock } from '../mock/db.mock';

describe('Client DAO (unit)', () => {
    let dao: MongodbClientDao;
    let collection: any;

    beforeAll(async () => {
        dao = new MongodbClientDao(DbMock);
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

    it('getByEmail() transfers correct arguments', async () => {
        const email = 'email';
        await dao.getByEmail(email);

        expect(collection.findOne).toHaveBeenCalledWith({ email });
        expect(collection.findOne).toHaveBeenCalledTimes(1);
    });

    it('getByEmailAndPasswordHash() transfers correct arguments', async () => {
        const email = 'email';
        const passwordHash = 'passwordHash';
        await dao.getByEmailAndPasswordHash(email, passwordHash);

        expect(collection.findOne).toHaveBeenCalledWith({ email, passwordHash });
        expect(collection.findOne).toHaveBeenCalledTimes(1);
    });

    it('setStatus() transfers correct arguments', async () => {
        await dao.setStatus('id', 'active' as any);

        expect(collection.updateMany).toHaveBeenCalledWith(
            {
                id: 'id'
            },
            {
                $set: {
                    status: 'active'
                },
            }
        );
        expect(collection.updateMany).toHaveBeenCalledTimes(1);
    });

    it('setVerificationStatus() transfers correct arguments', async () => {
        const isVerified = true;
        const id = 'id';

        await dao.setVerificationStatus(id, isVerified);

        expect(collection.updateMany).toHaveBeenCalledWith({ id }, {
            $set: { isVerified }
        });
        expect(collection.updateMany).toHaveBeenCalledTimes(1);
    });

    it('setVerificationStatus() transfers correct arguments', async () => {
        const isAdmin = true;
        const id = 'id';

        await dao.setAdminStatus(id, isAdmin);

        expect(collection.updateMany).toHaveBeenCalledWith({ id }, {
            $set: { isAdmin }
        });
        expect(collection.updateMany).toHaveBeenCalledTimes(1);
    });

    it('createClient() transfers correct arguments', async () => {
        const data = generateClient();
        await dao.createClient(data.email, data.passwordHash, data.isAdmin);

        expect(collection.insertOne).toHaveBeenCalledTimes(1);
    });

    it('removeById() transfers correct arguments', async () => {
        const id = 'id';
        await dao.removeById(id);

        expect(collection.deleteMany).toHaveBeenCalledTimes(1);
        expect(collection.deleteMany).toHaveBeenCalledWith({ id });
    });
});
