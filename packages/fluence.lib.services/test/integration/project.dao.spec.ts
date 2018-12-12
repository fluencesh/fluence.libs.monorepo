import * as config from 'config';
import { omit, random } from 'lodash';
import { Db, MongoClient } from 'mongodb';
import { v1 as generateId } from 'uuid';
import { MongodbProjectDao } from '../../src/dao/mongodb/project.dao';
import { Scheme } from '../../src/types';
import {
    clearCollections,
    getRandomItem,
    createEntities,
    generateProject
} from '../helpers';
import { DaoCollectionNames } from '../../src';
import 'jest-extended';

describe('Project DAO (integration)', () => {
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
        let dao: MongodbProjectDao;

        let projects: Array<Scheme.Project>;
        let project: Scheme.Project;
        let activeProject: Scheme.Project;

        beforeAll(async () => {
            dbName = config.get('multivest.mongodb.dbName') + 'ProjectDaoRead';
            db = connection.db(dbName);
            dao = new MongodbProjectDao(db);

            await clearCollections(db, [ DaoCollectionNames.Project ]);

            projects = new Array(15);
            await createEntities(dao, generateProject, projects);
        });

        beforeEach(() => {
            project = getRandomItem(projects);
            activeProject = getRandomItem(projects, (p) => !p.isRemoved && p.status === Scheme.ProjectStatus.Active);
        });

        afterAll(async () => {
            if (config.has('tests.dropDbAfterTest') && config.get('tests.dropDbAfterTest')) {
                await db.dropDatabase();
            }
        });

        it('should get by id', async () => {
            const got = await dao.getById(project.id);
    
            expect(got).toEqual(project);
        });
    
        it('should get by id (active only)', async () => {
            if (!activeProject) {
                return;
            }
    
            const got = await dao.getByIdActiveOnly(activeProject.id);
    
            expect(got).toEqual(activeProject);
        });
    
        it('should get by id (exists only)', async () => {
            if (!activeProject) {
                return;
            }
    
            const got = await dao.getByIdExistsOnly(activeProject.id);
    
            expect(got).toEqual(activeProject);
        });
    
        it('should get by ids', async () => {
            const filtered = projects.filter((p, index) => index < 3);
            const got = await dao.listByIds(filtered.map((p) => p.id));
    
            expect(got).toEqual(filtered);
        });
    
        it('should get by ids (active only)', async () => {
            const filtered = projects.filter((p) => !p.isRemoved && p.status === Scheme.ProjectStatus.Active);
    
            if (filtered.length) {
                return;
            }
    
            const got = await dao.listByIds(filtered.map((p) => p.id));
    
            expect(got).toEqual(filtered);
        });
    
        it('should get by client id', async () => {
            const filtered = projects.filter((p) => p.clientId === project.clientId);
    
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
    
            expect(got).toEqual(filtered);
        });
    
        it('should get by client id (active only)', async () => {
            if (!activeProject) {
                return;
            }

            const filtered = projects.filter((p) => p.clientId === activeProject.clientId);
    
            if (filtered.length) {
                return;
            }
    
            const got = await dao.listByClientId(activeProject.clientId);
    
            expect(got).toEqual(filtered);
        });
    
        it('should get by filters (active only)', async () => {
            if (!activeProject) {
                return;
            }

            const filtered = projects.filter((p) =>
                !p.isRemoved &&
                p.status === Scheme.ProjectStatus.Active &&
                p.name === activeProject.name &&
                p.webhookUrl === activeProject.webhookUrl &&
                p.status === activeProject.status &&
                p.sharedSecret === activeProject.sharedSecret &&
                p.isRemoved === false
            );
    
            const got = await dao.listByFiltersActiveOnly(
                activeProject.name,
                activeProject.sharedSecret,
                activeProject.status,
                activeProject.webhookUrl
            );
    
            expect(got).toEqual(filtered);
        });
    });

    describe('Create/Update operations', () => {
        let dbName: string;
        let db: Db;
        let dao: MongodbProjectDao;

        let projects: Array<Scheme.Project>;
        let project: Scheme.Project;

        beforeAll(async () => {
            dbName = config.get('multivest.mongodb.dbName') + 'ProjectDaoCreateUpdate';
            db = connection.db(dbName);
            dao = new MongodbProjectDao(db);

            await clearCollections(db, [ DaoCollectionNames.Project ]);

            projects = new Array(15);
            await createEntities(dao, generateProject, projects);
        });

        beforeEach(() => {
            project = getRandomItem(projects);
        });

        afterAll(async () => {
            if (config.has('tests.dropDbAfterTest') && config.get('tests.dropDbAfterTest')) {
                await db.dropDatabase();
            }
        });

        it('should create project', async () => {
            const data = generateProject();
    
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

            expect(created.clientId).toEqual(data.clientId);
            expect(created.name).toEqual(data.name);
            expect(created.webhookUrl).toEqual(data.webhookUrl);
            expect(created.sharedSecret).toEqual(data.sharedSecret);
            expect(created.status).toEqual(data.status);
            expect(created.txMinConfirmations).toEqual(data.txMinConfirmations);
            expect(created.saltyToken).toEqual(data.saltyToken);
            expect(created.salt).toEqual(data.salt);
    
            const got = await dao.getById(created.id);
            expect(got).toBeObject();

            projects.push(got);
        });
    
        it('should set new name, webhook url and status', async () => {
            const name = generateId();
            const webhookUrl = `https://www.${generateId()}.eu`;
            const status = project.status === Scheme.ProjectStatus.Active
                ? Scheme.ProjectStatus.Inactive
                : Scheme.ProjectStatus.Active;
    
            await dao.setNameAndWebhookUrlAndStatus(
                project.id,
                name,
                webhookUrl,
                status
            );
    
            const got = await dao.getById(project.id);
    
            expect(got.name).toEqual(name);
            expect(got.webhookUrl).toEqual(webhookUrl);
            expect(got.status).toEqual(status);

            project.name = name;
            project.webhookUrl = webhookUrl;
            project.status = status;
        });
    
        it('should set new status', async () => {
            const status = project.status === Scheme.ProjectStatus.Active
                ? Scheme.ProjectStatus.Inactive
                : Scheme.ProjectStatus.Active;
    
            await dao.setStatus(project.id, status);
            const got = await dao.getById(project.id);
    
            expect(got.status).toEqual(status);

            project.status = status;
        });
    
        it('should set new token', async () => {
            project.status = project.status === Scheme.ProjectStatus.Active
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
});
