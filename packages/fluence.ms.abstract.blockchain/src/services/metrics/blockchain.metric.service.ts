import { MetricService } from '@applicature/synth.metrics';
import { BlockchainNodeMetricType, TransactionSendStatusMetricType } from '../../types';

export class BlockchainMetricService extends MetricService {
    public getServiceId(): string {
        return 'blockchain.metric.service';
    }

    public async blockchainCalled(
        blockchainId: string,
        networkId: string,
        transportId: string,
        times: number = 1,
        timestamp: Date = new Date()
    ): Promise<void> {
        await this.saveMetric(`blockchain_calls_total`, times, timestamp, { blockchainId, networkId, transportId });
    }

    public async totalBlockchainNodes(
        blockchainId: string,
        networkId: string,
        count: number,
        timestamp: Date = new Date()
    ): Promise<void> {
        await this.saveMetric(
            `blockchain_nodes_total`,
            count,
            timestamp,
            { blockchainId, networkId, type: BlockchainNodeMetricType.Total }
        );
    }

    public async healthyBlockchainNodes(
        blockchainId: string,
        networkId: string,
        count: number,
        timestamp: Date = new Date()
    ): Promise<void> {
        await this.saveMetric(
            `blockchain_nodes_total`,
            count,
            timestamp,
            { blockchainId, networkId, type: BlockchainNodeMetricType.Healthy }
        );
    }

    public async unhealthyBlockchainNodes(
        blockchainId: string,
        networkId: string,
        count: number,
        timestamp: Date = new Date()
    ): Promise<void> {
        await this.saveMetric(
            `blockchain_nodes_total`,
            count,
            timestamp,
            { blockchainId, networkId, type: BlockchainNodeMetricType.Unhealthy }
        );
    }

    public async transactionsSuccessfullySent(
        blockchainId: string,
        networkId: string,
        transportId: string,
        count: number = 1,
        timestamp: Date = new Date()
    ): Promise<void> {
        await this.saveMetric(
            `transactions_sent_total`,
            count,
            timestamp,
            {
                blockchainId,
                networkId,
                status: TransactionSendStatusMetricType.Success,
                transportId
            }
        );
    }

    public async transactionsUnsuccessfullySent(
        blockchainId: string,
        networkId: string,
        transportId: string,
        count: number = 1,
        timestamp: Date = new Date()
    ): Promise<void> {
        await this.saveMetric(
            `transactions_sent_total`,
            count,
            timestamp,
            {
                blockchainId,
                networkId,
                status: TransactionSendStatusMetricType.Fail,
                transportId
            }
        );
    }

}
