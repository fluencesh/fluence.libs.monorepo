import { PrometheusMetric } from '@applicature-private/multivest.services.blockchain';
import * as config from 'config';
import { Counter } from 'prom-client';

export class ApiMetrics {
    public static getInstance() {
        this.instance = ApiMetrics.instance || new ApiMetrics();
        return this.instance;
    }

    private static instance: ApiMetrics;

    private metricProvider: Counter;

    private constructor() {
        this.metricProvider = PrometheusMetric.getInstance().addCounter({
            help: config.get<string>('multivest.metric.help.api'),
            labelNames: [ 'request' ],
            name: this.getMetricName(),
        });
    }

    public getMetricName() {
        return 'api:metric';
    }

    public incomingRequest(count: number = 1) {
        this.metricProvider.inc({ request: 'incoming' }, count, Date.now());
    }

    public successRequest(count: number = 1) {
        this.metricProvider.inc({ request: 'success' }, count, Date.now());
    }

    public failedRequest(count: number = 1) {
        this.metricProvider.inc({ request: 'failed' }, count, Date.now());
    }

    public timeoutRequest(count: number = 1) {
        this.metricProvider.inc({ request: 'timeout' }, count, Date.now());
    }

    public getReport(): string {
        return PrometheusMetric.getInstance().getReportBySingleMetric(this.getMetricName());
    }
}
