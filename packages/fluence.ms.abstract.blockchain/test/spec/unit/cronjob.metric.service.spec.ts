import { MetricTransport } from '@applicature/synth.metrics';
import { hostname } from 'os';
import { env } from 'process';
import { CronjobMetricService } from '../../../src';

describe('CronjobMetricService spec', () => {
    let metricService: CronjobMetricService;
    const saveMetricMock = jest.fn().mockImplementation(() => Promise.resolve(undefined));
    const nodeEnv = env.NODE_ENV;
    const hostName = hostname();

    class MetricTransportMock extends MetricTransport {
        public async saveMetric(...args: Array<any>): Promise<void> {
            return saveMetricMock(...args);
        }
    }

    beforeAll(() => {
        metricService = new CronjobMetricService(null);
        (metricService as any).transport = new MetricTransportMock();
    });

    beforeEach(() => {
        saveMetricMock.mockClear();
    });

    it('transactionsFoundInBlock should transfer right params', () => {
        const blockchainId = 'blockchainId';
        const networkId = 'networkId';
        const transportId = 'transportId';
        const count = 1;
        const timestamp = new Date();

        metricService.transactionsFoundInBlock(blockchainId, networkId, transportId, count, timestamp);

        expect(saveMetricMock).toHaveBeenCalledTimes(1);
        expect(saveMetricMock).toHaveBeenCalledWith(
            `transactions_found_total`,
            count,
            timestamp,
            { env: nodeEnv, hostname: hostName, blockchainId, networkId, transportId }
        );
    });

    it('contractsEventFoundInBlock should transfer right params', () => {
        const blockchainId = 'blockchainId';
        const networkId = 'networkId';
        const transportId = 'transportId';
        const count = 1;
        const timestamp = new Date();

        metricService.contractsEventFoundInBlock(blockchainId, networkId, transportId, count, timestamp);

        expect(saveMetricMock).toHaveBeenCalledTimes(1);
        expect(saveMetricMock).toHaveBeenCalledWith(
            `contracts_found_total`,
            count,
            timestamp,
            { env: nodeEnv, hostname: hostName, blockchainId, networkId, transportId }
        );
    });

    it('addressFoundInBlock should transfer right params', () => {
        const blockchainId = 'blockchainId';
        const networkId = 'networkId';
        const transportId = 'transportId';
        const count = 1;
        const timestamp = new Date();

        metricService.addressFoundInBlock(blockchainId, networkId, transportId, count, timestamp);

        expect(saveMetricMock).toHaveBeenCalledTimes(1);
        expect(saveMetricMock).toHaveBeenCalledWith(
            `address_found_total`,
            count,
            timestamp,
            { env: nodeEnv, hostname: hostName, blockchainId, networkId, transportId }
        );
    });
});
