import * as config from 'config';
import { Db, MongoClient } from 'mongodb';
import { MongodbScheduledTxDao } from '../../src/dao/mongodb/scheduled.tx.dao';
import { Scheme } from '../../src/types';
import { DaoCollectionNames } from '../../src';
import {
    clearCollections,
    createEntities,
    getRandomItem,
    generateScheduledTx,
    generateTransactionScheme
} from '../helpers';
import 'jest-extended';

describe('Scheduled TX DAO (integration)', () => {
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
        let dao: MongodbScheduledTxDao;

        let scheduledTxs: Array<Scheme.ScheduledTx>;
        let scheduledTx: Scheme.ScheduledTx;

        beforeAll(async () => {
            dbName = config.get('multivest.mongodb.dbName') + 'ScheduledTxDaoRead';
            db = connection.db(dbName);
            dao = new MongodbScheduledTxDao(db);

            await clearCollections(db, [ DaoCollectionNames.ScheduledTx ]);

            scheduledTxs = new Array(15);
            await createEntities(dao, generateScheduledTx, scheduledTxs);
        });

        beforeEach(() => {
            scheduledTx = getRandomItem(scheduledTxs);
        });

        afterAll(async () => {
            if (config.has('tests.dropDbAfterTest') && config.get('tests.dropDbAfterTest')) {
                await db.dropDatabase();
            }
        });

        it('should get by id', async () => {
            const got = await dao.getById(scheduledTx.id);

            expect(got).toEqual(scheduledTx);
        });

        it('should get by id and project id', async () => {
            const got = await dao.getByIdAndProjectId(scheduledTx.id, scheduledTx.projectId);

            expect(got).toEqual(scheduledTx);
        });

        it('should get by project id', async () => {
            const filtered = scheduledTxs.filter((stx) => stx.projectId === scheduledTx.projectId);
            const got = await dao.listByProjectId(scheduledTx.projectId);

            expect(got).toEqual(filtered);
        });
    });

    describe('Create/Update operations', () => {
        let dbName: string;
        let db: Db;
        let dao: MongodbScheduledTxDao;

        let scheduledTxs: Array<Scheme.ScheduledTx>;
        let scheduledTx: Scheme.ScheduledTx;

        beforeAll(async () => {
            dbName = config.get('multivest.mongodb.dbName') + 'ScheduledTxDaoCreateUpdate';
            db = connection.db(dbName);
            dao = new MongodbScheduledTxDao(db);

            await clearCollections(db, [ DaoCollectionNames.ScheduledTx ]);

            scheduledTxs = new Array(15);
            await createEntities(dao, generateScheduledTx, scheduledTxs);
        });

        beforeEach(() => {
            scheduledTx = getRandomItem(scheduledTxs);
        });

        afterAll(async () => {
            if (config.has('tests.dropDbAfterTest') && config.get('tests.dropDbAfterTest')) {
                await db.dropDatabase();
            }
        });

        it('should create scheduled tx', async () => {
            const data = generateScheduledTx();
            const created = await dao.createScheduledTx(
                data.projectId,
                data.cronExpression,
                data.tx,
                data.privateKey,
                data.transportConnectionId
            );
    
            expect(created.projectId).toEqual(data.projectId);
            expect(created.cronExpression).toEqual(data.cronExpression);
            expect(created.tx).toEqual(data.tx);
            expect(created.privateKey).toEqual(data.privateKey);
            expect(created.transportConnectionId).toEqual(data.transportConnectionId);

            const got = await dao.getById(created.id);
            expect(got).toBeObject();
        });
    
        it('should set new tx', async () => {
            const randomTx = generateTransactionScheme();
    
            await dao.setTransaction(scheduledTx.id, randomTx);
            const got = await dao.getById(scheduledTx.id);
    
            expect(got.tx).toEqual(randomTx);

            scheduledTx.tx = randomTx;
        });
    
        it('should set new cron expression', async () => {
            const newCronExp = '* 1/1 * 1,2,3 *';

            await dao.setCronExpression(scheduledTx.id, newCronExp);
            const got = await dao.getById(scheduledTx.id);

            expect(got.cronExpression).toEqual(newCronExp);

            scheduledTx.cronExpression = newCronExp;
        });
    
        it('should set relatedJobId', async () => {
            const relatedJobId = 'relatedJobId';

            await dao.setRelatedJobId(scheduledTx.id, relatedJobId);
            const got = await dao.getById(scheduledTx.id);

            expect(got.relatedJobId).toEqual(relatedJobId);
    
            scheduledTx.relatedJobId = relatedJobId;
        });
    });
});
