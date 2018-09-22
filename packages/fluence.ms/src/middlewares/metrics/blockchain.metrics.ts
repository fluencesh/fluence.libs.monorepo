import { MetricService } from '@applicature-private/fluence.metric.services';
import { BlockchainService } from '@applicature-private/multivest.services.blockchain';
import { NextFunction, Request, Response } from 'express';

export class BlockchainMetrics {
    private metricService: MetricService;
    private blockchainService: BlockchainService;

    constructor(
        metricService: MetricService,
        blockchainService: BlockchainService,
    ) {
        this.metricService = metricService;
        this.blockchainService = blockchainService;
    }

    public async processRequest(req: Request, res: Response, next: NextFunction) {
        const statistic = this.blockchainService.getStatistic();

        if (statistic.wasCalledTimes > 0) {
            const today = new Date();

            await Promise.all([
                this.metricService.blockchainCalled(
                    this.blockchainService.getBlockchainId(),
                    this.blockchainService.getNetworkId(),
                    statistic.wasCalledTimes,
                    today,
                ),
                this.metricService.activeBlockchainNodes(
                    this.blockchainService.getBlockchainId(),
                    this.blockchainService.getNetworkId(),
                    statistic.connectionsCount,
                    today,
                ),
                this.metricService.healthyBlockchainNodes(
                    this.blockchainService.getBlockchainId(),
                    this.blockchainService.getNetworkId(),
                    statistic.healthyConnectionsCount,
                    today,
                ),
                this.metricService.unhealthyBlockchainNodes(
                    this.blockchainService.getBlockchainId(),
                    this.blockchainService.getNetworkId(),
                    statistic.unhealthyConnectionsCount,
                    today,
                )
            ]);
        }

        next();
    }
}
