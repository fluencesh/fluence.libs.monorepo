import { MetricService } from '@fluencesh/fluence.metric.services';

export class CronjobMetricService extends MetricService {
    public getServiceId() {
        return 'cronjob.metric.service';
    }

    public async transactionsFoundInBlock(
        blockchainId: string,
        networkId: string,
        count: number = 1,
        timestamp: Date = new Date()
    ): Promise<void> {
        await this.saveMetric(
            'transactions_found_total',
            count,
            timestamp,
            { blockchainId, networkId }
        );
    }

    public async contractsEventFoundInBlock(
        blockchainId: string,
        networkId: string,
        count: number = 1,
        timestamp: Date = new Date()
    ): Promise<void> {
        await this.saveMetric(
            'contracts_found_total',
            count,
            timestamp,
            { blockchainId, networkId }
        );
    }

    public async addressFoundInBlock(
        blockchainId: string,
        networkId: string,
        count: number = 1,
        timestamp: Date = new Date()
    ): Promise<void> {
        await this.saveMetric(
            'address_found_total',
            count,
            timestamp,
            { blockchainId, networkId }
        );
    }
}
