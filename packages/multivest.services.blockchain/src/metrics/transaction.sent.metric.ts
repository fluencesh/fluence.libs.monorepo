import * as config from 'config';
import { Counter } from 'prom-client';
import { PrometheusMetric } from './prometheus.metric';

export class TransactionSentMetric {
    public static getInstance() {
        this.instance = TransactionSentMetric.instance || new TransactionSentMetric();
        return this.instance;
    }

    private static instance: TransactionSentMetric;

    private sentTxMetric: Counter;

    private constructor() {
        this.sentTxMetric = PrometheusMetric.getInstance().addCounter({
            name: this.getMetricName(),
            help: config.get('multivest.metric.help.sentTransactions'),
            labelNames: [ 'status' ]
        });
    }

    public getMetricName() {
        return 'transactions:sent:metric';
    }

    public successfulSending(count: number = 1): void {
        this.sentTxMetric.inc({ action: 'successfulSending' }, count, new Date());
        return;
    }

    public failedSending(count: number = 1) {
        this.sentTxMetric.inc({ action: 'failedSending' }, count, new Date());
        return;
    }

    public getReport(): string {
        return PrometheusMetric.getInstance().getReportBySingleMetric(this.getMetricName());
    }
}
