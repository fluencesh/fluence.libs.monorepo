import * as config from 'config';
import { Counter, Gauge } from 'prom-client';
import { PrometheusMetric } from './prometheus.metric';

export class BlockchainMetric {
    public static getInstance(blockchainId: string, networkId: string): BlockchainMetric {
        let instance = this.instances.find((i) => i.blockchainId === blockchainId && i.networkId === networkId);

        if (!instance) {
            instance = new BlockchainMetric(blockchainId, networkId);
        }

        return instance;
    }

    private static instances: Array<BlockchainMetric> = [];

    private nodeHealthMetric: Gauge;
    private blockchainCallsMetric: Counter;

    private blockchainId: string;
    private networkId: string;

    private constructor(blockchainId: string, networkId: string) {
        this.blockchainId = blockchainId;
        this.networkId = networkId;

        this.nodeHealthMetric = PrometheusMetric.getInstance().addGauge({
            name: this.getNodeHealthMetricName(),
            help: config.get('multivest.metric.help.nodeHealth'),
            labelNames: [ 'total', 'status' ]
        });

        this.blockchainCallsMetric = PrometheusMetric.getInstance().addCounter({
            name: this.getBlockchainCallsMetricName(),
            help: config.get('multivest.metric.help.blockchainCalls'),
        });
    }

    // NOTICE: separator `.` is unexceptable, so `:` is used
    public getNodeHealthMetricName() {
        return `${ this.blockchainId }:${ this.networkId }:node:health:metric`;
    }

    public getBlockchainCallsMetricName() {
        return `${ this.blockchainId }:${ this.networkId }:req:calls:metric`;
    }

    public called(count: number = 1) {
        this.blockchainCallsMetric.inc(count);
    }

    public activeNodes(count: number) {
        this.nodeHealthMetric.set({ total: 'active' }, count, new Date());
    }

    public healthyNodes(count: number) {
        this.nodeHealthMetric.set({ status: 'healthy' }, count, new Date());
    }

    public unhealthyNodes(count: number) {
        this.nodeHealthMetric.set({ status: 'unhealthy' }, count, new Date());
    }

    public getNodesReport(): string {
        return PrometheusMetric.getInstance().getReportBySingleMetric(this.getNodeHealthMetricName());
    }

    public getBlockchainCallsReport(): string {
        return PrometheusMetric.getInstance().getReportBySingleMetric(this.getBlockchainCallsMetricName());
    }
}
