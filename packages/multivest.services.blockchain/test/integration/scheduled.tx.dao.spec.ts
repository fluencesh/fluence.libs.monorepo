import * as config from 'config';
import { random } from 'lodash';
import { Db, MongoClient } from 'mongodb';
import { MongodbScheduledTxDao } from '../../src/dao/mongodb/scheduled.tx.dao';
import { Scheme } from '../../src/types';
import { randomScheduledTx, randomTransactionScheme } from '../helper';

describe('scheduled tx dao', () => {
    let dao: MongodbScheduledTxDao;
    const scheduledTxs: Array<Scheme.ScheduledTx> = [];
    const scheduledTxsCount = 15;
    let scheduledTx: Scheme.ScheduledTx;
    let connection: Db;

    beforeAll(async () => {
        connection = await MongoClient.connect(config.get('multivest.mongodb.url'), {});
        dao = new MongodbScheduledTxDao(connection);
        dao.remove({});

        for (let i = 0; i < scheduledTxsCount; i++) {
            scheduledTxs.push(await dao.create(randomScheduledTx()));
        }
    });

    beforeEach(() => {
        scheduledTx = scheduledTxs[random(0, scheduledTxsCount - 1)];
    });

    afterAll(async () => {
        await connection.db('multivest').collection(dao.getCollectionName()).remove({});

        connection.close();
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

    it('should create scheduled tx', async () => {
        const created = randomScheduledTx();
        const got = await dao.createScheduledTx(
            created.projectId,
            created.cronExpression,
            created.tx,
            created.privateKey
        );

        expect(got.projectId).toEqual(created.projectId);
        expect(got.cronExpression).toEqual(created.cronExpression);
        expect(got.tx).toEqual(created.tx);
        expect(got.privateKey).toEqual(created.privateKey);
    });

    it('should set new tx', async () => {
        const randomTx = randomTransactionScheme();
        scheduledTx.tx = randomTx;

        await dao.setTransaction(scheduledTx.id, randomTx);

        const got = await dao.getById(scheduledTx.id);

        expect(got.tx).toEqual(scheduledTx.tx);
    });

    it('should set new cron expression', async () => {
        const newCronExp = '* 1/1 * 1,2,3 *';
        scheduledTx.cronExpression = newCronExp;

        await dao.setCronExpression(scheduledTx.id, newCronExp);

        const got = await dao.getById(scheduledTx.id);

        expect(got.cronExpression).toEqual(scheduledTx.cronExpression);
    });
});
