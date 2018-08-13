import {
    Counter,
    CounterConfiguration,
    Gauge,
    GaugeConfiguration,
    Histogram,
    HistogramConfiguration,
    Metric,
    Registry,
    Summary,
    SummaryConfiguration
} from 'prom-client';

export class PrometheusMetric {
    public static getInstance() {
        PrometheusMetric.instance = PrometheusMetric.instance || new PrometheusMetric();

        return PrometheusMetric.instance;
    }

    private static instance: PrometheusMetric;

    private registry: Registry;

    private constructor() {
        this.registry = new Registry();
    }

    public addMetric(metric: Metric): void {
        this.registry.registerMetric(metric);

        return;
    }

    public addCounter(config: CounterConfiguration): Counter {
        const counter = this.getSingleMetric(config.name) as Counter || new Counter(config);
        this.addMetric(counter);

        return counter;
    }

    public addGauge(config: GaugeConfiguration): Gauge {
        const gauge = this.getSingleMetric(config.name) as Gauge || new Gauge(config);
        this.addMetric(gauge);

        return gauge;
    }

    public addHistogram(config: HistogramConfiguration): Histogram {
        const histogram = this.getSingleMetric(config.name) as Histogram || new Histogram(config);
        this.addMetric(histogram);

        return histogram;
    }

    public addSummary(config: SummaryConfiguration): Summary {
        const summary = this.getSingleMetric(config.name) as Summary || new Summary(config);
        this.addMetric(summary);

        return summary;
    }

    public getSingleMetric(name: string): Metric {
        return this.registry.getSingleMetric(name);
    }

    public getReport() {
        return this.registry.metrics();
    }

    public getReportBySingleMetric(name: string) {
        return this.registry.getSingleMetricAsString(name);
    }

    public removeSingleMetric(name: string): void {
        this.registry.removeSingleMetric(name);
    }

    public clearAllMetrics(): void {
        this.registry.clear();
    }
}
