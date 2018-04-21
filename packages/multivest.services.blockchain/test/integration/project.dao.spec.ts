import * as config from 'config';
import { Db, MongoClient } from 'mongodb';
import { MongodbProjectDao } from '../../src/dao/mongodb/project.dao';
import { Scheme } from '../../src/types';

import { omit, random } from 'lodash';
import { v1 as generateId } from 'uuid';

import { randomProject } from '../helper';

describe('address subscription dao', () => {
    let dao: MongodbProjectDao;
    const projects: Array<Scheme.Project> = [];
    const projectsCount = 15;
    let project: Scheme.Project;
    let connection: Db;

    beforeAll(async () => {
        connection = await MongoClient.connect(config.get('multivest.mongodb.url'), {});
        dao = new MongodbProjectDao(connection);
        dao.remove({});

        for (let i = 0; i < projectsCount; i++) {
            projects.push(await dao.create(randomProject()));
        }
    });

    beforeEach(() => {
        project = projects[random(0, projectsCount - 1)];
    });

    afterAll(async () => {
        await connection.db('multivest').collection('projects').remove({});

        connection.close();
    });

    it('should get by id', async () => {
        const got = await dao.getById(project.id);

        expect(got).toEqual(project);
    });

    it('should get by client id', async () => {
        const filtered = projects.filter((p) => p.clientId === project.clientId);

        const got = await dao.listByClientId(project.clientId);

        expect(got).toEqual(filtered);
    });

    it('should create project', async () => {
        const data = randomProject();

        const created = await dao.createProject(
            data.clientId,
            data.name,
            data.webhookUrl,
            data.sharedSecret,
            data.status
        );

        const got = await dao.getById(created.id);

        expect(got).toEqual(created);
    });

    it('should set new name, webhook url and status', async () => {
        project.name = generateId();
        project.webhookUrl = `https://www.${generateId()}.eu`;
        project.status = project.status === Scheme.ProjectStatus.Active
            ? Scheme.ProjectStatus.Inactive
            : Scheme.ProjectStatus.Active;

        await dao.setNameAndWebhookUrlAndStatus(
            project.id,
            project.name,
            project.webhookUrl,
            project.status
        );

        const got = await dao.getById(project.id);

        expect(got).toEqual(project);
    });

    it('should set new status', async () => {
        project.status = project.status === Scheme.ProjectStatus.Active
            ? Scheme.ProjectStatus.Inactive
            : Scheme.ProjectStatus.Active;

        await dao.setStatus(
            project.id,
            project.status
        );

        const got = await dao.getById(project.id);

        expect(got).toEqual(project);
    });
});
