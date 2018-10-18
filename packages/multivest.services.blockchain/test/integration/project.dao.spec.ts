import * as config from 'config';
import { omit, random } from 'lodash';
import { Db, MongoClient } from 'mongodb';
import { v1 as generateId } from 'uuid';
import { MongodbProjectDao } from '../../src/dao/mongodb/project.dao';
import { ProjectService } from '../../src/services/object/project.service';
import { Scheme } from '../../src/types';
import { randomProject } from '../helper';

describe('project dao', () => {
    let dao: MongodbProjectDao;
    const projects: Array<Scheme.Project> = [];
    const projectsCount = 15;
    let project: Scheme.Project;
    let projectActive: Scheme.Project;
    let connection: Db;

    function getActiveProjects() {
        // tslint:disable-next-line:no-shadowed-variable
        return projects.filter(
            (project) =>
                !project.isRemoved &&
                project.status === Scheme.ProjectStatus.Active
        );
    }

    beforeAll(async () => {
        connection = await MongoClient.connect(
            config.get('multivest.mongodb.url'),
            {}
        );
        dao = new MongodbProjectDao(connection);
        dao.remove({});

        const service = new ProjectService(null);

        for (let i = 0; i < projectsCount; i++) {
            const created = await dao.create(randomProject());

            projects.push(created);
        }
    });

    beforeEach(() => {
        project = projects[random(0, projectsCount - 1)];
        projectActive = getActiveProjects()[
            random(0, getActiveProjects().length - 1)
        ];
    });

    afterAll(async () => {
        await connection
            .db('multivest')
            .collection('projects')
            .remove({});

        connection.close();
    });

    it('should get by id', async () => {
        const got = await dao.getById(project.id);

        expect(got).toEqual(project);
    });

    it('should get by id (active only)', async () => {
        const active = getActiveProjects()[0];

        if (!active) {
            return;
        }

        const got = await dao.getByIdActiveOnly(active.id);

        expect(got).toEqual(active);
    });

    it('should get by id (exists only)', async () => {
        const active = getActiveProjects()[0];

        if (!active) {
            return;
        }

        const got = await dao.getByIdExistsOnly(active.id);

        expect(got).toEqual(active);
    });

    it('should get by ids', async () => {
        const filtered = projects.filter((p, index) => index < 3);
        const got = await dao.listByIds(filtered.map((p) => p.id));

        expect(got).toEqual(filtered);
    });

    it('should get by ids (active only)', async () => {
        const filtered = getActiveProjects();

        if (filtered.length) {
            return;
        }

        const got = await dao.listByIds(filtered.map((p) => p.id));

        expect(got).toEqual(filtered);
    });

    it('should get by client id', async () => {
        const filtered = projects.filter(
            (p) => p.clientId === project.clientId
        );

        const got = await dao.listByClientId(project.clientId);

        expect(got).toEqual(filtered);
    });

    it('should get by filters', async () => {
        const filtered = projects.filter(
            (p) =>
                p.name === project.name &&
                p.webhookUrl === project.webhookUrl &&
                p.status === project.status &&
                p.sharedSecret === project.sharedSecret &&
                p.clientId === project.clientId
        );

        const got = await dao.listByFilters(
            project.name,
            project.sharedSecret,
            project.status,
            project.webhookUrl,
            project.clientId
        );
    });

    it('should get by client id (active only)', async () => {
        const filtered = getActiveProjects().filter(
            (proj, _, projs) => proj.clientId === projs[0].clientId
        );

        if (filtered.length) {
            return;
        }

        const got = await dao.listByClientId(projectActive.clientId);

        expect(got).toEqual(filtered);
    });

    it('should get by filters', async () => {
        const filtered = projects.filter(
            (p) =>
                p.name === project.name &&
                p.webhookUrl === project.webhookUrl &&
                p.status === project.status &&
                p.sharedSecret === project.sharedSecret
        );

        const got = await dao.listByFilters(
            project.name,
            project.sharedSecret,
            project.status,
            project.webhookUrl
        );

        expect(got).toEqual(filtered);
    });

    it('should get by filters (active only)', async () => {
        const filtered = getActiveProjects().filter(
            (p) =>
                p.name === projectActive.name &&
                p.webhookUrl === projectActive.webhookUrl &&
                p.status === projectActive.status &&
                p.sharedSecret === projectActive.sharedSecret
        );

        const got = await dao.listByFiltersActiveOnly(
            projectActive.name,
            projectActive.sharedSecret,
            projectActive.status,
            projectActive.webhookUrl
        );

        expect(got).toEqual(filtered);
    });

    it('should create project', async () => {
        const data = randomProject();

        const created = await dao.createProject(
            data.clientId,
            data.name,
            data.webhookUrl,
            data.sharedSecret,
            data.status,
            data.txMinConfirmations,
            data.saltyToken,
            data.salt
        );

        const got = await dao.getById(created.id);

        expect(got).toEqual(omit(created, 'token'));
    });

    it('should set new name, webhook url and status', async () => {
        project.name = generateId();
        project.webhookUrl = `https://www.${generateId()}.eu`;
        project.status =
            project.status === Scheme.ProjectStatus.Active
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
        project.status =
            project.status === Scheme.ProjectStatus.Active
                ? Scheme.ProjectStatus.Inactive
                : Scheme.ProjectStatus.Active;

        await dao.setStatus(project.id, project.status);

        const got = await dao.getById(project.id);

        expect(got).toEqual(project);
    });

    it('should set new token', async () => {
        project.status =
            project.status === Scheme.ProjectStatus.Active
                ? Scheme.ProjectStatus.Inactive
                : Scheme.ProjectStatus.Active;

        const saltyToken = generateId();
        const salt = generateId();
        await dao.setToken(project.id, saltyToken, salt);

        const got = await dao.getById(project.id);

        expect(got.salt).toEqual(salt);
        expect(got.saltyToken).toEqual(saltyToken);

        project.salt = salt;
        project.saltyToken = saltyToken;
    });
    it('should get by filters (active only)', async () => {
        const filtered = getActiveProjects().filter(
            (p) =>
                p.name === project.name &&
                p.webhookUrl === project.webhookUrl &&
                p.status === project.status &&
                p.sharedSecret === project.sharedSecret &&
                p.clientId === project.clientId
        );

        if (filtered.length) {
            return;
        }

        const got = await dao.listByFiltersActiveOnly(
            project.name,
            project.sharedSecret,
            project.status,
            project.webhookUrl,
            project.clientId
        );

        expect(got).toEqual(filtered);
    });

    it('should create project', async () => {
        const data = randomProject();

        const created = await dao.createProject(
            data.clientId,
            data.name,
            data.webhookUrl,
            data.sharedSecret,
            data.status,
            data.txMinConfirmations,
            data.saltyToken,
            data.salt
        );

        const got = await dao.getById(created.id);

        expect(got).toEqual(omit(created, 'token'));
    });

    it('should set new name, webhook url and status', async () => {
        project.name = generateId();
        project.webhookUrl = `https://www.${generateId()}.eu`;
        project.status =
            project.status === Scheme.ProjectStatus.Active
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
        project.status =
            project.status === Scheme.ProjectStatus.Active
                ? Scheme.ProjectStatus.Inactive
                : Scheme.ProjectStatus.Active;

        await dao.setStatus(project.id, project.status);

        const got = await dao.getById(project.id);

        expect(got).toEqual(project);
    });

    it('should set new token', async () => {
        project.status =
            project.status === Scheme.ProjectStatus.Active
                ? Scheme.ProjectStatus.Inactive
                : Scheme.ProjectStatus.Active;

        const saltyToken = generateId();
        const salt = generateId();
        await dao.setToken(project.id, saltyToken, salt);

        const got = await dao.getById(project.id);

        expect(got.salt).toEqual(salt);
        expect(got.saltyToken).toEqual(saltyToken);

        project.salt = salt;
        project.saltyToken = saltyToken;
    });
});
