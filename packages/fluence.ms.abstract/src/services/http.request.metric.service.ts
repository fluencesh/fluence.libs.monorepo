import { MetricService } from '@applicature/synth.metrics';
import { HttpRequestExecutionStatusMetricType } from '../types';

export class HttpRequestMetricService extends MetricService {
    public getServiceId() {
        return 'http.request.metric.service';
    }

    public async incomingHttpRequests(count: number = 1, timestamp: Date = new Date()): Promise<void> {
        await this.saveMetric('incoming_http_requests_total', count, timestamp);
    }

    public async httpRequestsSuccessfullyExecuted(count: number = 1, timestamp: Date = new Date()): Promise<void> {
        await this.saveMetric(
            'http_requests_executed_total',
            count,
            timestamp,
            { status: HttpRequestExecutionStatusMetricType.Success }
        );
    }

    public async httpRequestsUnsuccessfullyExecuted(count: number = 1, timestamp: Date = new Date()): Promise<void> {
        await this.saveMetric(
            'http_requests_executed_total',
            count,
            timestamp,
            { status: HttpRequestExecutionStatusMetricType.Fail }
        );
    }

    public async httpRequestsTimeout(count: number = 1, timestamp: Date = new Date()): Promise<void> {
        await this.saveMetric('http_requests_timeout_total', count, timestamp);
    }
}
