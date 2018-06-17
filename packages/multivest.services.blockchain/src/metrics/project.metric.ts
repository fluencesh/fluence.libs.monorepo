import * as config from 'config';
import { Counter } from 'prom-client';
import { PrometheusMetric } from './prometheus.metric';

export class ProjectMetric {
    public static getInstance() {
        this.instance = ProjectMetric.instance || new ProjectMetric();
        return this.instance;
    }

    private static instance: ProjectMetric;

    private metricProvider: Counter;

    private constructor() {
        this.metricProvider = PrometheusMetric.getInstance().addCounter({
            name: this.getMetricName(),
            help: config.get('multivest.metric.help.project'),
            labelNames: [ 'state', 'action' ]
        });
    }

    public getMetricName() {
        return 'project:metric';
    }

    public created(count: number = 1): void {
        this.metricProvider.inc({ action: 'created' }, count, new Date());

        return;
    }

    public activated(count: number = 1) {
        this.metricProvider.inc({ state: 'activated' }, count, new Date());

        return;
    }

    public inactivated(count: number = 1) {
        this.metricProvider.inc({ state: 'inactivated' }, count, new Date());

        return;
    }

    public getReport(): string {
        return PrometheusMetric.getInstance().getReportBySingleMetric(this.getMetricName());
    }
}
