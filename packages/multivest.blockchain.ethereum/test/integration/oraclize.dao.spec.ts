import {
    MongodbProjectDao,
    Scheme
} from '@applicature-restricted/multivest.services.blockchain';
import * as config from 'config';
import { random } from 'lodash';
import { connect, Db } from 'mongodb';
import { DaoCollectionNames, DaoIds } from '../../src/constants';
import { MongodbOraclizeSubscriptionDao } from '../../src/dao/mongodb/oraclize.subscription.dao';
import { OraclizeStatus, OraclizeSubscription } from '../../src/types';
import { randomOraclize, randomProject } from '../helper';

describe('oraclize dao', () => {
    let dao: MongodbOraclizeSubscriptionDao;
    let db: Db;

    let oraclize: OraclizeSubscription;
    let oraclizes: Array<OraclizeSubscription>;
    const oraclizesCount: number = 10;

    // let project: Scheme.Project;
    let projects: Array<Scheme.Project>;
    const projectsCount: number = 10;

    function getRandomProject() {
        return projects[random(0, projects.length - 1)];
    }

    beforeAll(async () => {
        db = (await connect(config.get('multivest.mongodb.url'))).db('multivest');

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
    });

    beforeEach(() => {
        // project = randomProject();
        oraclize = oraclizes[random(0, oraclizes.length - 1)];
    });

    afterAll(async () => {
        await Promise.all(
            [DaoCollectionNames.Oraclize, 'projects'].map((collection) => db.collection(collection).remove({}))
        );
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
        expect(got).toEqual(filtered);
    });

    it('should get list of oraclize by event hash and status', async () => {
        const filtered = oraclizes.filter((o) => o.eventHash === oraclize.eventHash && o.status === oraclize.status);

        const got = await dao.listByEventHashAndStatus(oraclize.eventHash, oraclize.status);
        expect(got).toEqual(filtered);
    });

    it('should get list of oraclize by event hashes', async () => {
        const filtered = oraclizes.filter((o) => o.eventHash === oraclize.eventHash);

        const got = await dao.listByEventHashes([ oraclize.eventHash ]);
        expect(got).toEqual(filtered);
    });

    it('should get list of oraclize by eventHash and status', async () => {
        const filtered = oraclizes.filter((o) => o.eventHash === oraclize.eventHash && o.status === oraclize.status);

        const got = await dao.listByEventHashesAndStatus([ oraclize.eventHash ], oraclize.status);
        expect(got).toEqual(filtered);
    });

    it('should get list of oraclize by project id', async () => {
        const filtered = oraclizes.filter((o) => o.projectId === oraclize.projectId);

        const got = await dao.listByProjectId(oraclize.projectId);
        expect(got).toEqual(filtered);
    });

    it('should get list of oraclize by status', async () => {
        const filtered = oraclizes.filter((o) => o.status === oraclize.status);

        const got = await dao.listByStatus(oraclize.status);
        expect(got).toEqual(filtered);
    });

    it('should get list of oraclize by status and project id', async () => {
        const filtered = oraclizes.filter((o) => o.status === oraclize.status && o.projectId === oraclize.projectId);

        const got = await dao.listByStatusAndProjectId(oraclize.status, oraclize.projectId);
        expect(got).toEqual(filtered);
    });

    it('should create new oraclize', async () => {
        const randomOraclizeEntity = randomOraclize();

        const got = await dao.createOraclize(
            randomOraclizeEntity.projectId,
            randomOraclizeEntity.eventHash,
            randomOraclizeEntity.eventName,
            randomOraclizeEntity.eventInputTypes,
            randomOraclizeEntity.webhookUrl
        );
        expect(got.projectId).toEqual(randomOraclizeEntity.projectId);
        expect(typeof got.eventHash).toEqual('string');
        expect(got.webhookUrl).toEqual(randomOraclizeEntity.webhookUrl);
    });

    it('should set new status', async () => {
        oraclize.status = oraclize.status === OraclizeStatus.ENABLED ? OraclizeStatus.DISABLED : OraclizeStatus.ENABLED;

        await dao.setStatus(oraclize.id, oraclize.status);
        const got = await dao.getById(oraclize.id);

        expect(got).toEqual(oraclize);
    });
});
