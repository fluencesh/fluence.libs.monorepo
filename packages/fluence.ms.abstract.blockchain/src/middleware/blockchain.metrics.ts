import { BlockchainRegistryService } from '@fluencesh/fluence.lib.services';
import { NextFunction, Request, Response } from 'express';
import * as logger from 'winston';
import { BlockchainMetricService } from '../services/blockchain.metric.service';

export class BlockchainMetrics {
    private metricService: BlockchainMetricService;
    private blockchainServiceRegistry: BlockchainRegistryService;
    private blockchainId: string;
    private networkId?: string;

    constructor(
        metricService: BlockchainMetricService,
        blockchainServiceRegistry: BlockchainRegistryService,
        blockchainId: string,
        networkId?: string
    ) {
        this.metricService = metricService;
        this.blockchainServiceRegistry = blockchainServiceRegistry;
        this.blockchainId = blockchainId;
        this.networkId = networkId;
    }

    public async processRequest(req: Request, res: Response, next: NextFunction) {
        const blockchainServices = this.networkId
            ? [ this.blockchainServiceRegistry.getByBlockchainInfo(this.blockchainId, this.networkId) ]
            : this.blockchainServiceRegistry.listByBlockchainId(this.blockchainId);

        const metricRequests = [] as Array<Promise<void>>;
        for (const blockchainService of blockchainServices) {
            const statistic = blockchainService.getStatistic();
    
            if (statistic.wasCalledTimes > 0) {
                const today = new Date();
    
                metricRequests.push(
                    this.metricService.blockchainCalled(
                        blockchainService.getBlockchainId(),
                        blockchainService.getNetworkId(),
                        statistic.wasCalledTimes,
                        today
                    ),
                    this.metricService.totalBlockchainNodes(
                        blockchainService.getBlockchainId(),
                        blockchainService.getNetworkId(),
                        statistic.connectionsCount,
                        today
                    ),
                    this.metricService.healthyBlockchainNodes(
                        blockchainService.getBlockchainId(),
                        blockchainService.getNetworkId(),
                        statistic.healthyConnectionsCount,
                        today
                    ),
                    this.metricService.unhealthyBlockchainNodes(
                        blockchainService.getBlockchainId(),
                        blockchainService.getNetworkId(),
                        statistic.unhealthyConnectionsCount,
                        today
                    )
                );
            }
        }

        try {
            await Promise.all(metricRequests);
        } catch (ex) {
            logger.warn(`Can't save blockchain metrics. Reason: ${ ex.message }`);
        }

        next();
    }
}
