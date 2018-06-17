import * as config from 'config';
import { Counter } from 'prom-client';
import { PrometheusMetric } from './prometheus.metric';

export class SubscriptionMetric {
    public static getInstance() {
        this.instance = SubscriptionMetric.instance || new SubscriptionMetric();
        return this.instance;
    }

    private static instance: SubscriptionMetric;

    private metricProvider: Counter;

    private constructor() {
        this.metricProvider = PrometheusMetric.getInstance().addCounter({
            name: this.getMetricName(),
            help: config.get('multivest.metric.help.subscription'),
            labelNames: [ 'action' ]
        });
    }

    public getMetricName() {
        return 'subscription:metric';
    }

    public transactionFound(count: number = 1): void {
        this.metricProvider.inc({ action: 'transactionFound' }, count, new Date());

        return;
    }

    public eventFound(count: number = 1) {
        this.metricProvider.inc({ action: 'eventFound' }, count, new Date());

        return;
    }

    public addressFound(count: number = 1) {
        this.metricProvider.inc({ action: 'addressFound' }, count, new Date());

        return;
    }

    public getReport(): string {
        return PrometheusMetric.getInstance().getReportBySingleMetric(this.getMetricName());
    }
}
