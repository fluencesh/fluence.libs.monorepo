import * as config from 'config';
import { random, sortBy } from 'lodash';
import {connect, Db, MongoClient} from 'mongodb';
import { DaoCollectionNames, MongodbProjectDao, Scheme } from '../../src';
import { MongodbOraclizeSubscriptionDao } from '../../src/dao/mongodb/oraclize.subscription.dao';
import { clearDb, randomOraclize, randomProject } from '../helper';

describe('oraclize dao', () => {
    let dao: MongodbOraclizeSubscriptionDao;
    let projectDao: MongodbProjectDao;
    let db: Db;

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
        db = await MongoClient.connect(
            `${config.get('multivest.mongodb.urlWithDbPrefix')}-oraclize-dao`,
            {}
        );

        projectDao = new MongodbProjectDao(db);

        await projectDao.remove({});

        projects = await Promise.all(
            Array.from(Array(projectsCount))
                .map(() => projectDao.create(randomProject()))
        );
        
        dao = new MongodbOraclizeSubscriptionDao(db);

        await dao.remove({});

        oraclizes = await Promise.all(
            Array.from(Array(oraclizesCount))
                .map(() => dao.create(randomOraclize(getRandomProject().id)))
        );
    });

    beforeEach(() => {
        // project = randomProject();
        oraclize = oraclizes[random(0, oraclizes.length - 1)];
    });

    afterAll(async () => {
        await projectDao.remove({});
        await dao.remove({});

        await db.close();
    });

    it('should get oraclize by ID', async () => {
        const got = await dao.getById(oraclize.id);
        expect(got).toEqual(oraclize);
    });

    it('should get oraclize by ID and project ID', async () => {
        const got = await dao.getByIdAndProjectId(oraclize.id, oraclize.projectId);
        expect(got).toEqual(oraclize);
    });

    it('should get list of oraclize by event hash', async () => {
        const filtered = oraclizes.filter((o) => o.eventHash === oraclize.eventHash);

        const got = await dao.listByEventHash(oraclize.eventHash);
        expect(sortBy(got, 'id')).toEqual(sortBy(filtered, 'id'));
    });

    it('should get list of oraclize by event hash and status', async () => {
        const filtered = oraclizes.filter((o) =>
            o.eventHash === oraclize.eventHash
            && o.subscribed === oraclize.subscribed
        );

        const got = await dao.listByEventHashAndStatus(oraclize.eventHash, oraclize.subscribed);
        expect(sortBy(got, 'id')).toEqual(sortBy(filtered, 'id'));
    });

    it('should get list of oraclize by event hashes', async () => {
        const filtered = oraclizes.filter((o) => o.eventHash === oraclize.eventHash);

        const got = await dao.listByEventHashes([ oraclize.eventHash ]);
        expect(sortBy(got, 'id')).toEqual(sortBy(filtered, 'id'));
    });

    it('should get list of oraclize by eventHash and subscribed', async () => {
        const filtered = oraclizes.filter((o) =>
            o.eventHash === oraclize.eventHash && o.subscribed === oraclize.subscribed
        );

        const got = await dao.listByEventHashesAndStatus([ oraclize.eventHash ], oraclize.subscribed);
        expect(sortBy(got, 'id')).toEqual(sortBy(filtered, 'id'));
    });

    it('should get list of oraclize by project id', async () => {
        const filtered = oraclizes.filter((o) => o.projectId === oraclize.projectId);

        const got = await dao.listByProjectId(oraclize.projectId);
        expect(sortBy(got, 'id')).toEqual(sortBy(filtered, 'id'));
    });

    it('should get list of oraclize by subscribed', async () => {
        const filtered = oraclizes.filter((o) => o.subscribed === oraclize.subscribed);

        const got = await dao.listByStatus(oraclize.subscribed);
        expect(sortBy(got, 'id')).toEqual(sortBy(filtered, 'id'));
    });

    it('should get list of oraclize by subscribed and project id', async () => {
        const filtered = oraclizes.filter((o) =>
            o.subscribed === oraclize.subscribed && o.projectId === oraclize.projectId
        );

        const got = await dao.listByStatusAndProjectId(oraclize.subscribed, oraclize.projectId);
        expect(sortBy(got, 'id')).toEqual(sortBy(filtered, 'id'));
    });

    it('should create new oraclize', async () => {
        const randomOraclizeEntity = randomOraclize();

        const got = await dao.createSubscription(
            randomOraclizeEntity.clientId,
            randomOraclizeEntity.projectId,
            randomOraclizeEntity.transportConnectionId,
            randomOraclizeEntity.minConfirmations,
            randomOraclizeEntity.eventHash,
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

        await dao.setSubscribed(oraclize.id, oraclize.subscribed);
        const got = await dao.getById(oraclize.id);

        expect(got).toEqual(oraclize);
    });
});
