import { PluginManager } from '@applicature-private/multivest.core';
import * as config from 'config';
import { random } from 'lodash';
import { Db, MongoClient } from 'mongodb';
import { resolve } from 'path';
import { DaoIds } from '../../src/constants';
import { ClientDao } from '../../src/dao/client.dao';
import { MongodbScheduledTxDao } from '../../src/dao/mongodb/scheduled.tx.dao';
import { ProjectDao } from '../../src/dao/project.dao';
import { ScheduledTxJob } from '../../src/services/cronjob/scheduled.tx.job';
import { ScheduledTxJobManager } from '../../src/services/cronjob/scheduled.tx.job.manager';
import { ScheduledTxService } from '../../src/services/object/scheduled.tx.service';
import { Scheme } from '../../src/types';
import { randomClient, randomProject, randomScheduledTx, randomTransactionScheme } from '../helper';
import { AgendaMock } from '../mock/agenda.mock';

describe('scheduled tx service', () => {
    let dao: MongodbScheduledTxDao;
    const scheduledTxs: Array<Scheme.ScheduledTx> = [];
    const scheduledTxsCount = 15;
    let scheduledTx: Scheme.ScheduledTx;
    let connection: Db;
    let manager: ScheduledTxJobManager;
    let jobs: Array<ScheduledTxJob>;
    let service: ScheduledTxService;
    let client: Scheme.Client;
    let project: Scheme.Project;

    function getRandomScheduledTx() {
        const randomScheduledTxEntity = randomScheduledTx();
        randomScheduledTxEntity.projectId = project.id;

        return randomScheduledTxEntity;
    }

    beforeAll(async () => {
        connection = await MongoClient.connect(config.get('multivest.mongodb.url'), {});
        dao = new MongodbScheduledTxDao(connection);
        dao.remove({});

        const pm = new PluginManager([
            { path: '@applicature-private/multivest.mongodb' },
            { path: resolve(__dirname, '../../src/plugin.services.blockchain') }
        ]);
        pm.setJobExecutor(AgendaMock);
        await pm.init();

        const clientDao = pm.getDao(DaoIds.Client) as ClientDao;
        const randomClientEntity = randomClient();
        client = await clientDao.createClient(
            randomClientEntity.ethereumAddress,
            randomClientEntity.status,
            randomClientEntity.isAdmin
        );

        const projectDao = pm.getDao(DaoIds.Project) as ProjectDao;
        const randomProjectEntity = randomProject();
        project = await projectDao.createProject(
            client.id,
            randomProjectEntity.name,
            randomProjectEntity.webhookUrl,
            randomProjectEntity.sharedSecret,
            randomProjectEntity.status,
            randomProjectEntity.txMinConfirmations,
            randomProjectEntity.saltyToken,
            randomProjectEntity.salt
        );

        manager = new ScheduledTxJobManager(pm, null);

        for (let i = 0; i < scheduledTxsCount; i++) {
            const createdScheduledTx = await dao.create(getRandomScheduledTx());
            scheduledTxs.push(createdScheduledTx);
            manager.createJob(createdScheduledTx);
        }

        jobs = (manager as any).jobs;

        service = new ScheduledTxService(pm, null);
        (service as any).scheduledTxJobManager = manager;
    });

    beforeEach(() => {
        scheduledTx = scheduledTxs[random(0, scheduledTxsCount - 1)];
    });

    afterAll(async () => {
        await connection.db('multivest').collection(dao.getCollectionName()).remove({});

        connection.close();
    });

    it('should get by id', async () => {
        const got = await service.getById(scheduledTx.id);

        expect(got).toEqual(scheduledTx);
    });

    it('should get by id and project id', async () => {
        const got = await service.getByIdAndProjectId(scheduledTx.id, scheduledTx.projectId);

        expect(got).toEqual(scheduledTx);
    });

    it('should get by project id', async () => {
        const filtered = scheduledTxs.filter((stx) => stx.projectId === scheduledTx.projectId);
        const got = await service.listByProjectId(scheduledTx.projectId);

        expect(got).toEqual(filtered);
    });

    it('should create scheduled tx', async () => {
        const created = getRandomScheduledTx();
        const got = await service.createScheduledTx(
            created.projectId,
            created.cronExpression,
            created.tx,
            created.privateKey
        );

        expect(got.projectId).toEqual(created.projectId);
        expect(got.cronExpression).toEqual(created.cronExpression);
        expect(got.tx).toEqual(created.tx);
        expect(got.privateKey).toEqual(created.privateKey);

        const job = manager.getJobByScheduledTxId(got.id);
        expect(job).not.toBeUndefined();
    });

    it('should set new tx', async () => {
        const randomTx = randomTransactionScheme();
        scheduledTx.tx = randomTx;

        await service.setTransaction(scheduledTx.id, randomTx);

        const got = await service.getById(scheduledTx.id);
        expect(got.tx).toEqual(scheduledTx.tx);

        const job = manager.getJobByScheduledTxId(scheduledTx.id);
        expect((job as any).scheduledTx.tx).toEqual(scheduledTx.tx);
    });

    it('should set new cron expression', async () => {
        const newCronExp = '* * * 31W JAN ? 2016-2016';
        scheduledTx.cronExpression = newCronExp;

        await service.setCronExpression(scheduledTx.id, newCronExp);

        const got = await service.getById(scheduledTx.id);
        expect(got.cronExpression).toEqual(scheduledTx.cronExpression);

        const job = manager.getJobByScheduledTxId(scheduledTx.id);
        expect((job as any).scheduledTx.cronExpression).toEqual(newCronExp);
    });
});
