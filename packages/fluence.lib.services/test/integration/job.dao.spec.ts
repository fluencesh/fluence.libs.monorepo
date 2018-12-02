import * as config from 'config';
import { Db, MongoClient } from 'mongodb';
import { MongodbJobDao } from '../../src/dao/mongodb/job.dao';
import { Scheme } from '../../src/types';
import 'jest-extended';
import { clearCollections, createEntities, generateJob, getRandomItem } from '../helpers';
import { DaoCollectionNames } from '../../src';

describe('Job DAO (integration)', () => {
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
        let dao: MongodbJobDao;

        let jobs: Array<Scheme.EthereumEventLog>;
        let job: Scheme.EthereumEventLog;

        beforeAll(async () => {
            dbName = config.get('multivest.mongodb.dbName') + 'JobDaoRead';
            db = connection.db(dbName);
            dao = new MongodbJobDao(db);

            await clearCollections(db, [ DaoCollectionNames.Job ]);

            jobs = new Array(15);
            await createEntities(dao, generateJob, jobs);
        });

        beforeEach(() => {
            job = getRandomItem(jobs);
        });

        afterAll(async () => {
            if (config.has('tests.dropDbAfterTest') && config.get('tests.dropDbAfterTest')) {
                await db.dropDatabase();
            }
        });

        it('should get job by id', async () => {
            const got = await dao.getById(job.id);
            expect(got).toEqual(job);
        });
    });

    describe('Create/Update operations', () => {
        let dbName: string;
        let db: Db;
        let dao: MongodbJobDao;

        let jobs: Array<Scheme.EthereumEventLog>;
        let job: Scheme.EthereumEventLog;

        beforeAll(async () => {
            dbName = config.get('multivest.mongodb.dbName') + 'JobDaoCreateUpdate';
            db = connection.db(dbName);
            dao = new MongodbJobDao(db);

            await clearCollections(db, [ DaoCollectionNames.Job ]);

            jobs = new Array(15);
            await createEntities(dao, generateJob, jobs);
        });

        beforeEach(() => {
            job = getRandomItem(jobs);
        });

        afterAll(async () => {
            if (config.has('tests.dropDbAfterTest') && config.get('tests.dropDbAfterTest')) {
                await db.dropDatabase();
            }
        });

        it('should create new job', async () => {
            const data = generateJob();
            const created = await dao.createJob(data.id, data.params);

            expect(created.id).toEqual(data.id);
            expect(created.params).toEqual(data.params);
    
            const got = await dao.getById(job.id);
            expect(got).toBeObject();
        });

        it('should set block height and time', async () => {
            const random = generateJob();
            const date = new Date();
    
            await dao.setParams(job.id, {
                processedBlockHeight: random.params.processedBlockHeight,
                processedBlockTime: date
            });
    
            const got = await dao.getById(job.id);
            expect(got.params.processedBlockHeight).toEqual(random.params.processedBlockHeight);
            expect(got.params.processedBlockTime).toEqual(date);

            job.params = got.params;
        });
    });
});
