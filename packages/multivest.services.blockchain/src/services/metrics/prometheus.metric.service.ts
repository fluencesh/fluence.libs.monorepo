import { Hashtable, MultivestError, PluginManager } from '@fluencesh/multivest.core';
import { Plugin as MongoPlugin } from '@fluencesh/multivest.mongodb';
import { set } from 'lodash';
import { Counter, Registry } from 'prom-client';
import * as logger from 'winston';
import { DaoIds } from '../../constants';
import { PrometheusMetricDao } from '../../dao';
import { Errors } from '../../errors';
import { MetricService } from './metric.service';

export class PrometheusMetricService extends MetricService {
    private metricsNameIdMap: Hashtable<string>;
    private prometheusMetricDao: PrometheusMetricDao;

    constructor(pluginManager: PluginManager) {
        super(pluginManager);
    }

    public async init(): Promise<void> {
        await super.init();

        const mongoPlugin = this.pluginManager.get('mongodb') as any as MongoPlugin;
        this.prometheusMetricDao = await mongoPlugin.getDao(DaoIds.PrometheusMetric) as any as PrometheusMetricDao;

        this.metricsNameIdMap = (await this.prometheusMetricDao.listAll())
            .reduce<Hashtable<string>>((hashTable, metric) => set(hashTable, metric.name, metric.id), {});
    }

    public getServiceId() {
        return 'prometheus.metric.service';
    }

    public async collectAndResetMetrics(): Promise<string> {
        let metrics;
        try {
            metrics = await this.prometheusMetricDao.listAll();
        } catch (ex) {
            logger.error(`Can't get metrics from DB. Reason: ${ ex.message }`);
            throw new MultivestError(Errors.DB_EXECUTION_ERROR);
        }

        const registry = new Registry();

        const metricIds: Array<string> = [];
        for (const metric of metrics) {
            metricIds.push(metric.id);

            const counter = new Counter({
                help: '',
                name: metric.name,
            });
            counter.inc(metric.value);

            registry.registerMetric(counter);
        }

        try {
            await this.prometheusMetricDao.resetMetricsByIds(metricIds);
        } catch (ex) {
            logger.error(`Can't reset metrics. Reason: ${ ex.message }`);
            throw new MultivestError(Errors.DB_EXECUTION_ERROR);
        }

        return registry.metrics();
    }

    protected async saveMetric(name: string, value: number): Promise<void> {
        const metricId = this.metricsNameIdMap[name];

        if (metricId) {
            try {
                await this.prometheusMetricDao.incrementMetricValue(metricId, value);
            } catch (ex) {
                logger.error(`Can't update already exists metric in DB [${ metricId }]. Reason: ${ ex.message }`);
            }
        } else {
            try {
                const metric = await this.prometheusMetricDao.createMetric(name, value);
                this.metricsNameIdMap[metric.name] = metric.id;
            } catch (ex) {
                logger.error(`Can't create metric in DB [${ name }]. Reason: ${ ex.message }`);
            }
        }

        return;
    }
}
