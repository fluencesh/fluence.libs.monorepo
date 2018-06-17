import * as config from 'config';
import { Counter } from 'prom-client';
import { PrometheusMetric } from './prometheus.metric';

export class WebhookMetric {
    public static getInstance() {
        this.instance = this.instance || new WebhookMetric();

        return this.instance;
    }

    private static instance: WebhookMetric;

    private metricProvider: Counter;

    private constructor() {
        this.metricProvider = PrometheusMetric.getInstance().addCounter({
            name: this.getMetricName(),
            help: config.get('multivest.metric.help.webhook'),
            labelNames: [ 'actions', 'status', 'delayInSeconds' ]
        });
    }

    public getMetricName() {
        return 'webhook:metric';
    }

    public created(count: number = 1) {
        this.metricProvider.inc({ actions: 'created' }, count, new Date());
    }

    public successfulCall(count: number = 1) {
        this.metricProvider.inc({ status: 'successfulCall' }, count, new Date());
    }

    public unsuccessfulCall(count: number = 1) {
        this.metricProvider.inc({ status: 'unsuccessfulCall' }, count, new Date());
    }

    public oneSecondDelay(count: number = 1) {
        this.metricProvider.inc({ delayInSeconds: '1sec' }, count, new Date());
    }

    public threeSecondDelay(count: number = 1) {
        this.metricProvider.inc({ delayInSeconds: '3sec' }, count, new Date());
    }

    public fiveSecondsDelay(count: number = 1) {
        this.metricProvider.inc({ delayInSeconds: '5secs' }, count, new Date());
    }

    public tenSecondsDelay(count: number = 1) {
        this.metricProvider.inc({ delayInSeconds: '10secs' }, count, new Date());
    }

    public sixtySecondsDelay(count: number = 1) {
        this.metricProvider.inc({ delayInSeconds: '60secs' }, count, new Date());
    }

    public getReport(): string {
        return PrometheusMetric.getInstance().getReportBySingleMetric(this.getMetricName());
    }
}
