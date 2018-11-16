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

            const today = new Date();

            let oneOfTransportWasUsed = false;
            for (const transportConnectionId of Object.keys(statistic.transportsCallsStatistic)) {
                const callsCount = statistic.transportsCallsStatistic[transportConnectionId];
                if (callsCount > 0) {
                    oneOfTransportWasUsed = true;
                    metricRequests.push(
                        this.metricService.blockchainCalled(
                            blockchainService.getBlockchainId(),
                            blockchainService.getNetworkId(),
                            transportConnectionId,
                            callsCount,
                            today
                        )
                    );
                }
            }
    
            if (oneOfTransportWasUsed) {
                metricRequests.push(
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
            logger.error(`Can't save blockchain metrics. Reason: ${ ex.message }`);
        }

        next();
    }
}
