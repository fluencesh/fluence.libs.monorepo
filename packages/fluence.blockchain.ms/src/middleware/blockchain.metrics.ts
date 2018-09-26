import { BlockchainService } from '@fluencesh/multivest.services.blockchain';
import { NextFunction, Request, Response } from 'express';
import { BlockchainMetricService } from '../services/blockchain.metric.service';

export class BlockchainMetrics {
    private metricService: BlockchainMetricService;
    private blockchainService: BlockchainService;

    constructor(
        metricService: BlockchainMetricService,
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
                this.metricService.totalBlockchainNodes(
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
