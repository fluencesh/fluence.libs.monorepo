import * as config from 'config';
import { Db, MongoClient } from 'mongodb';
import { MongodbEthereumEventLogDao } from '../../src/dao/mongodb/ethereum.event.log.dao';
import { Scheme } from '../../src/types';
import { DaoCollectionNames } from '../../src';
import { clearCollections, generateEthereumEventLog, createEntities, getRandomItem } from '../helpers';
import 'jest-extended';

describe('Event Log DAO (integration)', () => {
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
        let dao: MongodbEthereumEventLogDao;

        let logs: Array<Scheme.EthereumEventLog>;
        let log: Scheme.EthereumEventLog;

        beforeAll(async () => {
            dbName = config.get('multivest.mongodb.dbName') + 'EthereumEventLogDaoRead';
            db = connection.db(dbName);
            dao = new MongodbEthereumEventLogDao(db);

            await clearCollections(db, [ DaoCollectionNames.EthereumEventLog ]);

            logs = new Array(15);
            await createEntities(dao, generateEthereumEventLog, logs);
        });

        beforeEach(() => {
            log = getRandomItem(logs);
        });

        afterAll(async () => {
            if (config.has('tests.dropDbAfterTest') && config.get('tests.dropDbAfterTest')) {
                await db.dropDatabase();
            }
        });

        it('should get by id', async () => {
            const got = await dao.getById(log.id);

            expect(got).toEqual(log);
        });

        it('should get by list of id', async () => {
            const filtered = logs.filter((l, index) => index % 3);
            const filteredIds = filtered.map((l) => l.id);

            const got = await dao.listByIds(filteredIds);

            expect(got).toEqual(filtered);
        });
    });

    describe('Create/Update operations', () => {
        let dbName: string;
        let db: Db;
        let dao: MongodbEthereumEventLogDao;

        let logs: Array<Scheme.EthereumEventLog>;
        let log: Scheme.EthereumEventLog;

        beforeAll(async () => {
            dbName = config.get('multivest.mongodb.dbName') + 'EthereumEventLogDaoCreateUpdate';
            db = connection.db(dbName);
            dao = new MongodbEthereumEventLogDao(db);

            await clearCollections(db, [ DaoCollectionNames.EthereumEventLog ]);

            logs = new Array(15);
            await createEntities(dao, generateEthereumEventLog, logs);
        });

        beforeEach(() => {
            log = getRandomItem(logs);
        });

        afterAll(async () => {
            if (config.has('tests.dropDbAfterTest') && config.get('tests.dropDbAfterTest')) {
                await db.dropDatabase();
            }
        });

        it('should create ethereum event log', async () => {
            const data = generateEthereumEventLog();
    
            const created = await dao.createEvent(
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

            expect(created.blockChainId).toEqual(data.blockChainId);
            expect(created.networkId).toEqual(data.networkId);
            expect(created.blockHash).toEqual(data.blockHash);
            expect(created.blockHeight).toEqual(data.blockHeight);
            expect(created.blockTime).toEqual(data.blockTime);
            expect(created.txHash).toEqual(data.txHash);
            expect(created.address).toEqual(data.address);
            expect(created.event).toEqual(data.event);
            expect(created.eventHash).toEqual(data.eventHash);
            expect(created.params).toEqual(data.params);
    
            const got = await await dao.getById(created.id);
            expect(got).toBeObject();
        });
    });
});
