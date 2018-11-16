import { MetricTransport } from '@applicature/core.metrics';
import { hostname } from 'os';
import { env } from 'process';
import { BlockchainMetricService } from '../../../src';
import { BlockchainNodeMetricType, TransactionSendStatusMetricType } from '../../../src/types';

describe('BlockchainMetricService spec', () => {
    let metricService: BlockchainMetricService;
    const saveMetricMock = jest.fn().mockImplementation(() => Promise.resolve(undefined));
    const nodeEnv = env.NODE_ENV;
    const hostName = hostname();

    class MetricTransportMock extends MetricTransport {
        public async saveMetric(...args: Array<any>): Promise<void> {
            return saveMetricMock(...args);
        }
    }

    beforeAll(() => {
        metricService = new BlockchainMetricService(null);
        (metricService as any).transport = new MetricTransportMock();
    });

    beforeEach(() => {
        saveMetricMock.mockClear();
    });

    it('activeBlockchainNodes should transfer right params', () => {
        const blockchainId = 'blockchainId';
        const networkId = 'networkId';
        const count = 1;
        const timestamp = new Date();

        metricService.totalBlockchainNodes(blockchainId, networkId, count, timestamp);

        expect(saveMetricMock).toHaveBeenCalledTimes(1);
        expect(saveMetricMock).toHaveBeenCalledWith(
            `blockchain_nodes_total`,
            count,
            timestamp,
            { env: nodeEnv, hostname: hostName, type: BlockchainNodeMetricType.Total, blockchainId, networkId }
        );
    });

    it('blockchainCalled should transfer right params', () => {
        const blockchainId = 'blockchainId';
        const networkId = 'networkId';
        const transportId = 'transportId';
        const count = 1;
        const timestamp = new Date();

        metricService.blockchainCalled(blockchainId, networkId, transportId, count, timestamp);

        expect(saveMetricMock).toHaveBeenCalledTimes(1);
        expect(saveMetricMock).toHaveBeenCalledWith(
            `blockchain_calls_total`,
            count,
            timestamp,
            { env: nodeEnv, hostname: hostName, blockchainId, networkId, transportId }
        );
    });

    it('healthyBlockchainNodes should transfer right params', () => {
        const blockchainId = 'blockchainId';
        const networkId = 'networkId';
        const count = 1;
        const timestamp = new Date();

        metricService.healthyBlockchainNodes(blockchainId, networkId, count, timestamp);

        expect(saveMetricMock).toHaveBeenCalledTimes(1);
        expect(saveMetricMock).toHaveBeenCalledWith(
            `blockchain_nodes_total`,
            count,
            timestamp,
            { env: nodeEnv, hostname: hostName, type: BlockchainNodeMetricType.Healthy, blockchainId, networkId }
        );
    });

    it('healthyBlockchainNodes should transfer right params', () => {
        const blockchainId = 'blockchainId';
        const networkId = 'networkId';
        const count = 1;
        const timestamp = new Date();

        metricService.unhealthyBlockchainNodes(blockchainId, networkId, count, timestamp);

        expect(saveMetricMock).toHaveBeenCalledTimes(1);
        expect(saveMetricMock).toHaveBeenCalledWith(
            `blockchain_nodes_total`,
            count,
            timestamp,
            { env: nodeEnv, hostname: hostName, type: BlockchainNodeMetricType.Unhealthy, blockchainId, networkId }
        );
    });

    it('transactionsSuccessfullySent should transfer right params', () => {
        const blockchainId = 'blockchainId';
        const networkId = 'networkId';
        const transportId = 'transportId';
        const count = 1;
        const timestamp = new Date();

        metricService.transactionsSuccessfullySent(blockchainId, networkId, transportId, count, timestamp);

        expect(saveMetricMock).toHaveBeenCalledTimes(1);
        expect(saveMetricMock).toHaveBeenCalledWith(
            `transactions_sent_total`,
            count,
            timestamp,
            {
                blockchainId,
                env: nodeEnv,
                hostname: hostName,
                networkId,
                transportId,
                status: TransactionSendStatusMetricType.Success
            }
        );
    });

    it('transactionsUnsuccessfullySent should transfer right params', () => {
        const blockchainId = 'blockchainId';
        const networkId = 'networkId';
        const transportId = 'transportId';
        const count = 1;
        const timestamp = new Date();

        metricService.transactionsUnsuccessfullySent(blockchainId, networkId, transportId, count, timestamp);

        expect(saveMetricMock).toHaveBeenCalledTimes(1);
        expect(saveMetricMock).toHaveBeenCalledWith(
            `transactions_sent_total`,
            count,
            timestamp,
            {
                blockchainId,
                env: nodeEnv,
                hostname: hostName,
                networkId,
                transportId,
                status: TransactionSendStatusMetricType.Fail
            }
        );
    });
});
