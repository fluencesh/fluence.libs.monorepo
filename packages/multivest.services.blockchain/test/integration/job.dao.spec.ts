import * as config from 'config';
import { Db, MongoClient } from 'mongodb';

import { MongodbJobDao } from '../../src/dao/mongodb/job.dao';
import { randomJob } from '../../src/generation/jobs';
import { Scheme } from '../../src/types';

describe('job dao', () => {
    let dao: MongodbJobDao;
    let job: Scheme.Job;
    let connection: Db;

    beforeAll(async () => {
        connection = await MongoClient.connect(config.get('multivest.mongodb.url'), {});
        dao = new MongodbJobDao(connection);

        await dao.remove({});

        const random = randomJob();
        job = await dao.createJob(random.id, random.params);
    });

    afterAll(async () => {
        await connection.db('multivest').collection('jobs').remove({});

        connection.close();
    });

    it('should get job by id', async () => {
        const got = await dao.getById(job.id);
        expect(got).toEqual(job);
    });

    it('should set block height and time', async () => {
        const random = randomJob();
        const date = new Date();

        await dao.setParams(job.id, {
            processedBlockHeight: random.params.processedBlockHeight,
            processedBlockTime: date
        });

        const got = await dao.getById(job.id);
        expect(got.params.processedBlockHeight).toEqual(random.params.processedBlockHeight);
        expect(got.params.processedBlockTime).toEqual(date);
    });

});
