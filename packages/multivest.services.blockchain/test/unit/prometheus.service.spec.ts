import { get, random } from 'lodash';
import { Counter, Gauge, Histogram, Summary } from 'prom-client';
import { PrometheusMetric } from '../../src/metrics/prometheus.metric';

describe('prometheus service', () => {
    let metric: PrometheusMetric;
    let counter: Counter;
    let gauge: Gauge;
    let histogram: Histogram;
    let summary: Summary;

    beforeAll(() => {
        metric = PrometheusMetric.getInstance();

        counter = metric.addCounter({
            name: 'counter',
            help: 'help',
            labelNames: [ 'someStuff' ]
        });

        gauge = metric.addGauge({
            name: 'clients',
            help: 'help',
            labelNames: [ 'actions' ]
        });

        gauge.set({ actions: 'registered' }, 0);
        gauge.set({ actions: 'verifiedEmail' }, 0);
        gauge.set({ actions: 'restoredPassword' }, 0);

        histogram = metric.addHistogram({
            name: 'histogram',
            help: 'help',
            labelNames: [ 'label' ],
            buckets: [-1, 1],
        });

        summary = metric.addSummary({
            name: 'summary',
            help: 'help',
            labelNames: [ 'label' ],
            percentiles: [0, 50, 100],
        });
    });

    it('should increment exemplar of Counter', () => {
        const path = 'hashMap.actions:registered.value';

        counter.inc({ actions: 'registered' });

        expect(get(counter, path)).toEqual(1);
    });

    it('should increment exemplar of Counter custom times', () => {
        const path = 'hashMap.actions:registered.value';
        const containedValue = get(counter, path);
        const value: number = random(0, 100);

        counter.inc(
            { actions: 'registered' },
            value,
            new Date()
        );

        expect(get(counter, path)).toEqual(value + containedValue);
    });

    it('should increment exemplar of Gauge', () => {
        const path = 'hashMap.actions:registered.value';

        gauge.inc({ actions: 'registered' });

        expect(get(gauge, path)).toEqual(1);
    });

    it('should increment exemplar of Gauge custom times', () => {
        const path = 'hashMap.actions:registered.value';
        const containedValue = get(gauge, path);
        const value: number = random(0, 100);

        gauge.inc(
            { actions: 'registered' },
            value,
            new Date()
        );

        expect(get(gauge, path)).toEqual(value + containedValue);
    });

    it('should add value to exemplar of Histogram', () => {
        const path = 'hashMap.label:someLabel.sum';
        const value = random(0, 100);

        histogram.observe({ label: 'someLabel' }, -1);
        histogram.observe({ label: 'someLabel' }, 1);
        histogram.observe({ label: 'someLabel' }, -1);
        histogram.observe({ label: 'someLabel' }, -1);
        histogram.observe({ label: 'someLabel' }, 1);

        expect(get(histogram, path)).toEqual(-1);
    });

    it('should add value to exemplar of Summary', () => {
        const path = 'hashMap.label:someLabel.sum';
        const value = random(0, 100);

        summary.observe({ label: 'someLabel' }, 0);
        summary.observe({ label: 'someLabel' }, 0);
        summary.observe({ label: 'someLabel' }, 50);
        summary.observe({ label: 'someLabel' }, 50);
        summary.observe({ label: 'someLabel' }, 100);

        expect(get(summary, path)).toEqual(200);
    });
});
