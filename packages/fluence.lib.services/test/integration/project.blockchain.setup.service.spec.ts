import * as config from 'config';
import { Db, MongoClient } from 'mongodb';
import { MongodbProjectBlockchainSetupDao, MongodbTransportConnectionDao } from '../../src/dao/mongodb';
import { Scheme } from '../../src/types';
import 'jest-extended';
import { DaoCollectionNames, ProjectBlockchainSetupService, TransportConnectionService } from '../../src';
import {
    clearCollections,
    generateProjectBlockchainSetup,
    createEntities,
    getRandomItem,
    initProjectBlockchainSetupService,
    generateTransportConnection
} from '../helpers';

describe('Project Blockchain Setup Service (integration)', () => {
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
        let service: ProjectBlockchainSetupService;

        let setups: Array<Scheme.ProjectBlockchainSetup>;
        let setup: Scheme.ProjectBlockchainSetup;

        beforeAll(async () => {
            dbName = config.get('multivest.mongodb.dbName') + 'ProjectBlockchainSetupServiceRead';
            db = connection.db(dbName);

            await clearCollections(
                db,
                [ DaoCollectionNames.ProjectBlockchainSetup, DaoCollectionNames.TransportConnection ]
            );

            service = initProjectBlockchainSetupService(db);

            const connections: Array<Scheme.TransportConnection> = new Array(15);
            await createEntities(new MongodbTransportConnectionDao(db), generateTransportConnection, connections);

            setups = new Array(15);
            await createEntities(
                new MongodbProjectBlockchainSetupDao(db),
                () => {
                    const data = generateProjectBlockchainSetup();
                    data.privateTransportConnectionId = connections[0].id;
                    connections.splice(0, 1);
                    return data;
                },
                setups
            );
        });

        beforeEach(() => {
            setup = getRandomItem(setups);
        });

        afterAll(async () => {
            if (config.has('tests.dropDbAfterTest') && config.get('tests.dropDbAfterTest')) {
                await db.dropDatabase();
            }
        });

        it('should get by id', async () => {
            const got = await service.getById(setup.id);
            expect(got).toEqual(setup);
        });
    
        it('should get by id and project id', async () => {
            const got = await service.getByIdAndProjectId(setup.id, setup.projectId);
            expect(got).toEqual(setup);
        });
    
        it('should get by transport connection id', async () => {
            const got = await service.getByTransportConnectionId(setup.privateTransportConnectionId);
            expect(got).toEqual(setup);
        });
    
        it('should get by transport connection id and project id', async () => {
            const got = await service.getByTransportConnectionIdAndProjectId(
                setup.privateTransportConnectionId,
                setup.projectId
            );
            expect(got).toEqual(setup);
        });
    
        it('should get list by project id', async () => {
            const filtered = setups.filter((s) => s.projectId === setup.projectId);
            const got = await service.listByProjectId(setup.projectId);
        
            expect(got).toEqual(filtered);
        });
    
        it('should get list by project id and blockchain id', async () => {
            const filtered = setups.filter((s) =>
                s.projectId === setup.projectId && s.blockchainId === setup.blockchainId
            );
            const got = await service.listByProjectIdAndBlockchainId(
                setup.projectId,
                setup.blockchainId
            );
        
            expect(got).toEqual(filtered);
        });
    });

    describe('Create/Update operations', () => {
        let dbName: string;
        let db: Db;
        let service: ProjectBlockchainSetupService;

        let setups: Array<Scheme.ProjectBlockchainSetup>;
        let setup: Scheme.ProjectBlockchainSetup;

        beforeAll(async () => {
            dbName = config.get('multivest.mongodb.dbName') + 'ProjectBlockchainSetupServiceCreateUpdate';
            db = connection.db(dbName);

            await clearCollections(
                db,
                [ DaoCollectionNames.ProjectBlockchainSetup, DaoCollectionNames.TransportConnection ]
            );

            service = initProjectBlockchainSetupService(db);

            const connections: Array<Scheme.TransportConnection> = new Array(15);
            await createEntities(new MongodbTransportConnectionDao(db), generateTransportConnection, connections);

            setups = new Array(15);
            await createEntities(
                new MongodbProjectBlockchainSetupDao(db),
                () => {
                    const data = generateProjectBlockchainSetup();
                    data.privateTransportConnectionId = getRandomItem(connections).id;
                    return data;
                },
                setups
            );
        });

        beforeEach(() => {
            setup = getRandomItem(setups);
        });

        afterAll(async () => {
            if (config.has('tests.dropDbAfterTest') && config.get('tests.dropDbAfterTest')) {
                await db.dropDatabase();
            }
        });

        it('should create new setup', async () => {
            const data = generateProjectBlockchainSetup();
            const created = await service.createSetup(
                data.projectId,
                data.blockchainId,
                data.privateTransportConnectionId
            );
        
            expect(created.projectId).toEqual(data.projectId);
            expect(created.blockchainId).toEqual(data.blockchainId);
            expect(created.privateTransportConnectionId).toEqual(data.privateTransportConnectionId);

            const got = await service.getById(created.id);
            expect(got).toBeObject();

            setups.push(got);
        });
    
        it('should set status of setup', async () => {
            const status = setup.status === Scheme.ProjectBlockchainSetupStatus.Disabled
                ? Scheme.ProjectBlockchainSetupStatus.Enabled
                : Scheme.ProjectBlockchainSetupStatus.Disabled;
        
            await service.setStatus(setup.id, status);
        
            const got = await service.getById(setup.id);
            expect(got.status).toEqual(status);
        
            setup.status = status;
        });
    
        it('should set status of setup by project id', async () => {
            const status = setup.status === Scheme.ProjectBlockchainSetupStatus.Disabled
                ? Scheme.ProjectBlockchainSetupStatus.Enabled
                : Scheme.ProjectBlockchainSetupStatus.Disabled;

            await service.setStatusByProjectId(setup.projectId, status);
            
            const got = await service.listByProjectId(setup.projectId);

            const filtered = setups.filter((s) => s.projectId === setup.projectId);

            expect(got).toHaveLength(filtered.length);
            expect(got.map((s) => s.id)).toIncludeAllMembers(filtered.map((s) => s.id));
            expect(got).toSatisfyAll((s: Scheme.ProjectBlockchainSetup) => s.status === status);
    
            filtered.forEach((s) => s.status = status);
        });
    });

    describe('Delete operations', () => {
        let dbName: string;
        let db: Db;
        let service: ProjectBlockchainSetupService;

        let setups: Array<Scheme.ProjectBlockchainSetup>;
        let setup: Scheme.ProjectBlockchainSetup;

        beforeAll(async () => {
            dbName = config.get('multivest.mongodb.dbName') + 'ProjectBlockchainSetupServiceDelete';
            db = connection.db(dbName);

            await clearCollections(
                db,
                [ DaoCollectionNames.ProjectBlockchainSetup, DaoCollectionNames.TransportConnection ]
            );

            service = initProjectBlockchainSetupService(db);

            const connections: Array<Scheme.TransportConnection> = new Array(15);
            await createEntities(new MongodbTransportConnectionDao(db), generateTransportConnection, connections);

            setups = new Array(15);
            await createEntities(
                new MongodbProjectBlockchainSetupDao(db),
                () => {
                    const data = generateProjectBlockchainSetup();
                    data.privateTransportConnectionId = getRandomItem(connections).id;
                    return data;
                },
                setups
            );
        });

        beforeEach(() => {
            setup = getRandomItem(setups);
        });

        afterAll(async () => {
            if (config.has('tests.dropDbAfterTest') && config.get('tests.dropDbAfterTest')) {
                await db.dropDatabase();
            }
        });

        it('should remove setup by id', async () => {
            await service.removeById(setup.id);

            const got = await service.getById(setup.id);
            expect(got).toBeNull();
        });

        it('should remove setup by projectId', async () => {
            await service.removeByProjectId(setup.projectId);

            const got = await service.listByProjectId(setup.projectId);
            expect(got).toHaveLength(0);

            setups
                .filter((item) => item.projectId === setup.projectId)
                .forEach((item, index, items) => items.splice(index, 1));
        });
    });
});
