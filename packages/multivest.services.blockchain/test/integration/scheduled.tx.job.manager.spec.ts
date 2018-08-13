import { PluginManager } from '@fluencesh/multivest.core';
import * as config from 'config';
import { random } from 'lodash';
import { Db, MongoClient } from 'mongodb';
import { resolve } from 'path';
import { DaoIds } from '../../src/constants';
import { MongodbClientDao } from '../../src/dao/mongodb/client.dao';
import { MongodbProjectDao } from '../../src/dao/mongodb/project.dao';
import { ScheduledTxJob } from '../../src/services/cronjob/scheduled.tx.job';
import { ScheduledTxJobManager } from '../../src/services/cronjob/scheduled.tx.job.manager';
import { Scheme } from '../../src/types';
import { randomClient, randomProject, randomScheduledTx, randomTransactionScheme } from '../helper';
import { AgendaMock } from '../mock/agenda.mock';

describe('scheduled tx job manager', () => {
    let manager: ScheduledTxJobManager;
    const agendaMock = AgendaMock;
    let connection: Db;
    let jobsList: Array<ScheduledTxJob>;
    let pm: PluginManager;
    let client: Scheme.Client;
    let project: Scheme.Project;
    let job: ScheduledTxJob;

    beforeAll(async () => {
        pm = new PluginManager([
            { path: '@fluencesh/multivest.mongodb' },
            { path: resolve(__dirname, '../../src/plugin.services.blockchain') }
        ]);

        pm.setJobExecutor(agendaMock as any);

        await pm.init();

        connection = await MongoClient.connect(config.get('multivest.mongodb.url'), {});

        const clientDao = new MongodbClientDao(connection);
        const randomClientEntity = randomClient();
        client = await clientDao.createClient(
            randomClientEntity.ethereumAddress,
            randomClientEntity.status,
            randomClientEntity.isAdmin
        );

        const projectDao = new MongodbProjectDao(connection);
        const randomProjectEntity = randomProject();
        project = await projectDao.createProject(
            randomClientEntity.id,
            randomProjectEntity.name,
            randomProjectEntity.webhookUrl,
            randomProjectEntity.sharedSecret,
            randomProjectEntity.status,
            randomProjectEntity.txMinConfirmations,
            randomProjectEntity.saltyToken,
            randomProjectEntity.salt
        );

        manager = new ScheduledTxJobManager(pm, null);
        jobsList = (manager as any).jobs;

        for (let index = 0; index < 5; index++) {
            jobsList.push(getRandomScheduledJob());
        }
    });

    beforeEach(() => {
        job = jobsList[random(0, jobsList.length - 1)];
    });

    afterAll(async () => {
        await Promise.all(
            [DaoIds.Project, DaoIds.Client, DaoIds.ScheduledTx]
                .map((collection) => connection.collection(collection))
        );
    });

    function getRandomScheduledJob() {
        const scheduledTx = getRandomScheduledTx();

        return new ScheduledTxJob(pm, null, scheduledTx);
    }

    function getRandomScheduledTx() {
        const randomScheduledTxEntity = randomScheduledTx();
        randomScheduledTxEntity.projectId = project.id;

        return randomScheduledTxEntity;
    }

    it('should return job by id', () => {
        const got = manager.getJobById(job.getJobId());

        expect(got).toEqual(job);
    });

    it('should return job by scheduled tx id', () => {
        const got = manager.getJobByScheduledTxId(job.getScheduledTxId());

        expect(got).toEqual(job);
    });

    it('should add job', async () => {
        const createdJob = getRandomScheduledJob();
        await manager.addJob(createdJob);

        const got = manager.getJobById(createdJob.getJobId());
        expect(got).toEqual(createdJob);
    });

    it('should create job', async () => {
        const scheduledTx = getRandomScheduledTx();
        const createdJob = await manager.createJob(scheduledTx);

        const got = manager.getJobById(createdJob.getJobId());
        expect(got).toEqual(createdJob);
    });

    it('should change cron exp of job', async () => {
        const newCronExp = '1/1 * * ? * * *';
        await manager.changeCronExpression(job.getJobId(), newCronExp);

        expect((job as any).scheduledTx.cronExpression).toEqual(newCronExp);
    });

    it('should change job tx', async () => {
        const tx = randomTransactionScheme();
        await manager.changeTransaction(job.getJobId(), tx);

        expect((job as any).scheduledTx.tx).toEqual(tx);
    });
});
