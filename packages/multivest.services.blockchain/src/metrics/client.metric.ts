import * as config from 'config';
import { Counter } from 'prom-client';
import { PrometheusMetric } from './prometheus.metric';

export class ClientMetric {
    public static getInstance() {
        this.instance = ClientMetric.instance || new ClientMetric();
        return this.instance;
    }

    private static instance: ClientMetric;

    private metricProvider: Counter;

    private constructor() {
        this.metricProvider = PrometheusMetric.getInstance().addCounter({
            name: this.getMetricName(),
            help: config.get('multivest.metric.help.client'),
            labelNames: [ 'actions' ]
        });
    }

    public getMetricName() {
        return 'client:metric';
    }

    public registered(count: number = 1): void {
        this.metricProvider.inc({ action: 'registered' }, count, new Date());

        return;
    }

    public emailVerified(count: number = 1) {
        this.metricProvider.inc({ action: 'emailVerified' }, count, new Date());

        return;
    }

    public passwordRestored(count: number = 1) {
        this.metricProvider.inc({ action: 'passwordRestored' }, count, new Date());

        return;
    }

    public getReport(): string {
        return PrometheusMetric.getInstance().getReportBySingleMetric(this.getMetricName());
    }
}
