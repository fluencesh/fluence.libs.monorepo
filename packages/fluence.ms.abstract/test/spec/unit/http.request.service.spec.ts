import { MetricTransport } from '@applicature/synth.metrics';
import { hostname } from 'os';
import { env } from 'process';
import { HttpRequestExecutionStatusMetricType, HttpRequestMetricService } from '../../../src';

describe('HttpRequestMetricService spec', () => {
    let metricService: HttpRequestMetricService;
    const saveMetricMock = jest.fn().mockImplementation(() => Promise.resolve(undefined));
    const nodeEnv = env.NODE_ENV;
    const hostName = hostname();

    class MetricTransportMock extends MetricTransport {
        public async saveMetric(...args: Array<any>): Promise<void> {
            return saveMetricMock(...args);
        }
    }

    beforeAll(() => {
        metricService = new HttpRequestMetricService(null);
        (metricService as any).transport = new MetricTransportMock();
    });

    beforeEach(() => {
        saveMetricMock.mockClear();
    });

    it('incomingHttpRequests should transfer right params', () => {
        const count = 1;
        const timestamp = new Date();

        metricService.incomingHttpRequests(count, timestamp);

        expect(saveMetricMock).toHaveBeenCalledTimes(1);
        expect(saveMetricMock).toHaveBeenCalledWith(
            `incoming_http_requests_total`,
            count,
            timestamp,
            { env: nodeEnv, hostname: hostName }
        );
    });

    it('httpRequestsSuccessfullyExecuted should transfer right params', () => {
        const count = 1;
        const timestamp = new Date();

        metricService.httpRequestsSuccessfullyExecuted(count, timestamp);

        expect(saveMetricMock).toHaveBeenCalledTimes(1);
        expect(saveMetricMock).toHaveBeenCalledWith(
            `http_requests_executed_total`,
            count,
            timestamp,
            { env: nodeEnv, hostname: hostName, status: HttpRequestExecutionStatusMetricType.Success }
        );
    });

    it('httpRequestsUnsuccessfullyExecuted should transfer right params', () => {
        const count = 1;
        const timestamp = new Date();

        metricService.httpRequestsUnsuccessfullyExecuted(count, timestamp);

        expect(saveMetricMock).toHaveBeenCalledTimes(1);
        expect(saveMetricMock).toHaveBeenCalledWith(
            `http_requests_executed_total`,
            count,
            timestamp,
            { env: nodeEnv, hostname: hostName, status: HttpRequestExecutionStatusMetricType.Fail }
        );
    });

    it('httpRequestsTimeout should transfer right params', () => {
        const count = 1;
        const timestamp = new Date();

        metricService.httpRequestsTimeout(count, timestamp);

        expect(saveMetricMock).toHaveBeenCalledTimes(1);
        expect(saveMetricMock).toHaveBeenCalledWith(
            `http_requests_timeout_total`,
            count,
            timestamp,
            { env: nodeEnv, hostname: hostName }
        );
    });
});
