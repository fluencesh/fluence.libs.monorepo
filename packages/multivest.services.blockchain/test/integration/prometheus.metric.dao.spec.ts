import { PluginManager } from '@applicature-private/multivest.core';
import { resolve } from 'path';
import { DaoCollectionNames, DaoIds, MongodbPrometheusMetricDao, Scheme } from '../../src';
import { clearDb, createEntities, generateRandomPrometheusMetric, getRandomItem } from '../helper';

describe('prometheus metric', () => {
    let dao: MongodbPrometheusMetricDao;

    const metrics: Array<Scheme.PrometheusMetric> = new Array(15);
    let metric: Scheme.PrometheusMetric;

    beforeAll(async () => {
        const pluginManager = new PluginManager([
            { path: '@applicature-private/multivest.mongodb' },
            { path: resolve(__dirname, '../../src/plugin.services.blockchain') }
        ]);

        await pluginManager.init();

        dao = pluginManager.getDao(DaoIds.PrometheusMetric) as MongodbPrometheusMetricDao;

        await clearDb([ DaoCollectionNames.PrometheusMetric ]);
        await createEntities(dao, generateRandomPrometheusMetric, metrics);
    });

    beforeEach(() => {
        metric = getRandomItem(metrics);
    });

    it('should return metric by id', async () => {
        const got = await dao.getById(metric.id);

        expect(got).toEqual(metric);
    });

    it('should return list of all metrics', async () => {
        const got = await dao.listAll();

        expect(got).toEqual(metrics);
    });

    it('should create new metric', async () => {
        const data = generateRandomPrometheusMetric();
        const got = await dao.createMetric(data.name, data.value);

        expect(got.name).toEqual(data.name);
        expect(got.value).toEqual(data.value);

        metrics.push(got);
    });

    it('should increment value of metric by ID', async () => {
        const incrementOn = 5;
        await dao.incrementMetricValue(metric.id, incrementOn);

        const got = await dao.getById(metric.id);
        expect(got.value).toEqual(metric.value + incrementOn);

        metric.value += incrementOn;
    });

    it('should set new value by metric\'s ID', async () => {
        const newValue = metric.value + 5;
        await dao.setMetricValue(metric.id, newValue);

        const got = await dao.getById(metric.id);
        expect(got.value).toEqual(newValue);

        metric.value = newValue;
    });

    it('should reset metrics by IDs', async () => {
        const ids = metrics
            .filter((metricItem, index) => index < 5)
            .map((metricItem) => metricItem.id);

        await dao.resetMetricsByIds(ids);

        const metricsFromDb = await dao.listAll();
        const resetMetrics = metricsFromDb.filter((metricItem) => ids.includes(metricItem.id));

        resetMetrics.forEach((resetMetric) => {
            expect(resetMetric.value).toEqual(0);
        });

        metrics
            .filter((metricItem) => ids.includes(metricItem.id))
            .forEach((metricItem) => {
                metricItem.value = 0;
            });
    });

    it('should remove metric by ID', async () => {
        await dao.removeMetric(metric.id);

        const got = await dao.getById(metric.id);
        expect(got).toBeNull();

        metrics.splice(metrics.indexOf(metric), 1);
    });
});
