import * as config from 'config';
import { random, sortBy } from 'lodash';
import { connect, Db } from 'mongodb';
import { DaoCollectionNames, MongodbProjectDao, Scheme } from '../../src';
import { OraclizeSubscriptionService } from '../../src';
import { MongodbOraclizeSubscriptionDao } from '../../src/dao/mongodb/oraclize.subscription.dao';
import { clearDb, randomOraclize, randomProject } from '../helper';

describe('oraclize service', () => {
    let dao: MongodbOraclizeSubscriptionDao;
    let db: Db;

    let service: OraclizeSubscriptionService;

    let oraclize: Scheme.OraclizeSubscription;
    let oraclizes: Array<Scheme.OraclizeSubscription>;
    const oraclizesCount: number = 10;

    // let project: Scheme.Project;
    let projects: Array<Scheme.Project>;
    const projectsCount: number = 10;

    function getRandomProject() {
        return projects[random(0, projects.length - 1)];
    }

    beforeAll(async () => {
        db = (await connect(config.get('multivest.mongodb.url'))).db('multivest');

        await clearDb([
            DaoCollectionNames.Oraclize,
            DaoCollectionNames.Project
        ]);

        const projectDao = new MongodbProjectDao(db);
        projects = await Promise.all(
            Array.from(Array(projectsCount))
                .map(() => projectDao.create(randomProject()))
        );
        
        dao = new MongodbOraclizeSubscriptionDao(db);
        oraclizes = await Promise.all(
            Array.from(Array(oraclizesCount))
                .map(() => dao.create(randomOraclize(getRandomProject().id)))
        );

        service = new OraclizeSubscriptionService(null);
        (service as any).dao = dao;
    });

    beforeEach(() => {
        // project = randomProject();
        oraclize = oraclizes[random(0, oraclizes.length - 1)];
    });

    afterAll(async () => {
        await db.close();
    });

    it('should get oraclize by ID', async () => {
        const got = await service.getById(oraclize.id);
        expect(got).toEqual(oraclize);
    });

    it('should get oraclize by ID and project ID', async () => {
        const got = await service.getByIdAndProjectId(oraclize.id, oraclize.projectId);
        expect(got).toEqual(oraclize);
    });

    it('should get list of oraclize by event hash', async () => {
        const filtered = oraclizes.filter((o) => o.eventHash === oraclize.eventHash);

        const got = await service.listByEventHash(oraclize.eventHash);
        expect(sortBy(got, 'id')).toEqual(sortBy(filtered, 'id'));
    });

    it('should get list of oraclize by event hash and status', async () => {
        const filtered = oraclizes.filter((o) =>
            o.eventHash === oraclize.eventHash
            && o.subscribed === oraclize.subscribed
        );

        const got = await service.listByEventHashAndStatus(oraclize.eventHash, oraclize.subscribed);
        expect(sortBy(got, 'id')).toEqual(sortBy(filtered, 'id'));
    });

    it('should get list of oraclize by event hashes', async () => {
        const filtered = oraclizes.filter((o) => o.eventHash === oraclize.eventHash);

        const got = await service.listByEventHashes([ oraclize.eventHash ]);
        expect(sortBy(got, 'id')).toEqual(sortBy(filtered, 'id'));
    });

    it('should get list of oraclize by eventHash and subscribed', async () => {
        const filtered = oraclizes.filter((o) =>
            o.eventHash === oraclize.eventHash && o.subscribed === oraclize.subscribed
        );

        const got = await service.listByEventHashesAndStatus([ oraclize.eventHash ], oraclize.subscribed);
        expect(sortBy(got, 'id')).toEqual(sortBy(filtered, 'id'));
    });

    it('should get list of oraclize by project id', async () => {
        const filtered = oraclizes.filter((o) => o.projectId === oraclize.projectId);

        const got = await service.listByProjectId(oraclize.projectId);
        expect(sortBy(got, 'id')).toEqual(sortBy(filtered, 'id'));
    });

    it('should get list of oraclize by subscribed', async () => {
        const filtered = oraclizes.filter((o) => o.subscribed === oraclize.subscribed);

        const got = await service.listByStatus(oraclize.subscribed);
        expect(sortBy(got, 'id')).toEqual(sortBy(filtered, 'id'));
    });

    it('should get list of oraclize by subscribed and project id', async () => {
        const filtered = oraclizes.filter((o) =>
            o.subscribed === oraclize.subscribed && o.projectId === oraclize.projectId
        );

        const got = await service.listByStatusAndProjectId(oraclize.subscribed, oraclize.projectId);
        expect(sortBy(got, 'id')).toEqual(sortBy(filtered, 'id'));
    });

    it('should create new oraclize', async () => {
        const randomOraclizeEntity = randomOraclize();

        const got = await service.createSubscription(
            randomOraclizeEntity.clientId,
            randomOraclizeEntity.projectId,
            randomOraclizeEntity.blockchainId,
            randomOraclizeEntity.networkId,
            randomOraclizeEntity.minConfirmations,
            randomOraclizeEntity.eventName,
            randomOraclizeEntity.eventInputTypes,
            randomOraclizeEntity.webhookUrl
        );

        expect(got.projectId).toEqual(randomOraclizeEntity.projectId);
        expect(typeof got.eventHash).toEqual('string');
        expect(got.webhookUrl).toEqual(randomOraclizeEntity.webhookUrl);
    });

    it('should set new subscribed', async () => {
        oraclize.subscribed = !oraclize.subscribed;

        await service.setSubscribed(oraclize.id, oraclize.subscribed);
        const got = await service.getById(oraclize.id);

        expect(got).toEqual(oraclize);
    });
});
