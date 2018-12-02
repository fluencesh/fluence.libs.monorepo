import * as config from 'config';
import { v1 as generateId } from 'uuid';
import {
    Scheme,
    MongodbTransactionDao,
    DaoCollectionNames
} from '../../src';
import 'jest-extended';
import {
    clearCollections,
    createEntities,
    getRandomItem,
    generateTransaction
} from '../helpers';
import { Db, MongoClient } from 'mongodb';

describe('Transaction DAO (integration)', () => {
    let mongoUrl: string;
    let connection: MongoClient;

    beforeAll(async () => {
        mongoUrl = config.get<string>('multivest.mongodb.url');
        connection = await MongoClient.connect(mongoUrl);
    });

    afterAll(async () => {
        await connection.close();
    });

    describe('Read operations', () => {
        let dbName: string;
        let db: Db;
        let dao: MongodbTransactionDao;

        let txs: Array<Scheme.Transaction>;
        let tx: Scheme.Transaction;

        beforeAll(async () => {
            dbName = config.get('multivest.mongodb.dbName') + 'TxDaoRead';
            db = connection.db(dbName);
            dao = new MongodbTransactionDao(db);

            await clearCollections(db, [ DaoCollectionNames.Transaction ]);

            txs = new Array(15);
            await createEntities(dao, generateTransaction, txs);
        });

        beforeEach(() => {
            tx = getRandomItem(txs);
        });

        afterAll(async () => {
            if (config.has('tests.dropDbAfterTest') && config.get('tests.dropDbAfterTest')) {
                await db.dropDatabase();
            }
        });

        it('should get transaction by uniqId', async () => {
            const got = await dao.getByUniqId(tx.uniqId);
            expect(got).toEqual(tx);
        });
    
        it('should get by transaction hash', async () => {
            const got = await dao.getByHash(tx.ref.hash);
            expect(got).toEqual(tx);
        });
    
        it('should list by network and status', async () => {
            const mined = txs.filter((item) =>
                item.status === Scheme.TransactionStatus.Mined
                && item.blockChainId === tx.blockChainId
            );
            const got = await dao.listByNetworkAndStatus(
                tx.blockChainId, tx.networkId, Scheme.TransactionStatus.Mined
            );
            expect(got.length).toEqual(mined.length);
        });
    
        it('should list by uniqId and network', async () => {
            const found = txs.filter((item) => item.uniqId === tx.uniqId);
            const got = await dao.listByUniqId(tx.blockChainId, tx.networkId, tx.uniqId);
            expect(got.length).toBe(found.length);
        });
    
        it('should find by sender address', async () => {
            const found = txs.filter((item) => item.ref.from[0].address === tx.ref.from[0].address);
            const got = await dao.listByUniqId(tx.blockChainId, tx.networkId, tx.uniqId);
            expect(got.length).toBe(found.length);
        });
    });

    describe('Create/Update operations', () => {
        let dbName: string;
        let db: Db;
        let dao: MongodbTransactionDao;

        let txs: Array<Scheme.Transaction>;
        let tx: Scheme.Transaction;

        beforeAll(async () => {
            dbName = config.get('multivest.mongodb.dbName') + 'TxDaoCreateUpdate';
            db = connection.db(dbName);
            dao = new MongodbTransactionDao(db);

            await clearCollections(db, [ DaoCollectionNames.Transaction ]);

            txs = new Array(15);
            await createEntities(dao, generateTransaction, txs);
        });

        beforeEach(() => {
            tx = getRandomItem(txs);
        });

        afterAll(async () => {
            if (config.has('tests.dropDbAfterTest') && config.get('tests.dropDbAfterTest')) {
                await db.dropDatabase();
            }
        });

        it('should set hash and status', async () => {
            const newHash = `0x${generateId()}`;
            await dao.setHashAndStatus(tx.id, newHash, Scheme.TransactionStatus.Sent);
            const got = await dao.getByUniqId(tx.uniqId);
            expect(got.ref.hash).toBe(newHash);
            expect(got.status).toBe(Scheme.TransactionStatus.Sent);

            tx.ref.hash = newHash;
            tx.status = Scheme.TransactionStatus.Sent;
        });
    
        it('should set mined block', async () => {
            const block = {
                hash: `0x${generateId()}`,
                height: 13536475,
                time: Date.now()
            };
            await dao.setMinedBlock(
                tx.blockChainId,
                tx.networkId,
                tx.ref.hash,
                block.hash,
                block.height,
                block.time
            );
            const got = await dao.getByUniqId(tx.uniqId);
            expect(got.ref.blockHash).toBe(block.hash);
            expect(got.ref.blockHeight).toBe(block.height);
            expect(got.ref.blockTime).toBe(block.time);

            tx.ref.blockHash = block.hash;
            tx.ref.blockHeight = block.height;
            tx.ref.blockTime = block.time;
        });
    
        it('should create transaction', async () => {
            const data = generateTransaction();
            const created = await dao.createTransaction(
                data.blockChainId,
                data.networkId,
                data.uniqId,
                data.ref as Scheme.BlockchainTransaction,
                data.status
            );

            expect(created.blockChainId).toEqual(data.blockChainId);
            expect(created.networkId).toEqual(data.networkId);
            expect(created.uniqId).toEqual(data.uniqId);
            expect(created.ref).toEqual(data.ref);
            expect(created.status).toEqual(data.status);

            const got = await dao.getByUniqId(data.uniqId);
            expect(got).toBeObject();
        });
    });
});
