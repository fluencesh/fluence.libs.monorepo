import { PluginManager, Service, Hashtable, MultivestError } from '@applicature-private/core.plugin-manager';
import {
    BlockchainRegistryService,
    TransportConnectionSubscriptionService,
    Scheme,
    JobService,
    BlockchainService,
} from '@applicature-private/fluence.lib.services';
import * as logger from 'winston';
import { BlockchainListenerJob, HandlerData } from '../types';
import { BlockchainListenerHandler } from './blockchain.listener.handler';

export class BlockchainListener extends Service {
    private readonly blockchainRegistry: BlockchainRegistryService;
    private readonly blockchainId: string;

    private readonly tcsService: TransportConnectionSubscriptionService;
    private readonly jobService: JobService;

    private inited: boolean;

    private readonly handlers: Array<BlockchainListenerHandler>;

    constructor(
        pluginManager: PluginManager,
        blockchainRegistry: BlockchainRegistryService,
        blockchainId: string,

        handlers: Array<BlockchainListenerHandler>
    ) {
        super(pluginManager);

        this.blockchainId = blockchainId;
        this.blockchainRegistry = blockchainRegistry;
        this.inited = false;

        this.handlers = handlers;

        this.tcsService = this.pluginManager.getServiceByClass(TransportConnectionSubscriptionService);
        this.jobService = this.pluginManager.getServiceByClass(JobService);
    }

    public getServiceId() {
        return `blockchain.${ this.blockchainId }.listener`;
    }

    public async init() {
        if (this.inited) {
            return;
        }

        logger.info(`tying to init ${ this.getServiceId() }...`);
        const jobId = this.getServiceId();
        const job = await this.jobService.getById(jobId);
        if (!job) {
            logger.debug(`job [${ this.getServiceId() }] was not found in DB. trying to create new one.`);
            await this.jobService.createJob(jobId, {});
        } else {
            logger.debug(`job [${ this.getServiceId() }] was found in DB. Job: ${ JSON.stringify(job) }`);
        }

        this.inited = true;

        logger.debug(`${ this.getServiceId() } successfully inited`);
    }

    public async execute() {
        try {
            await this.init();
        } catch (ex) {
            logger.error(`failed to init job ${ this.getServiceId() }`);
            return;
        }

        let transportConnections: Array<Scheme.TransportConnectionSubscription>;
        try {
            transportConnections = await this.tcsService.listByStatusAndBlockchainInfo(
                Scheme.TransportConnectionSubscriptionStatus.Subscribed,
                this.blockchainId
            );
        } catch (ex) {
            logger.error(`cant load transport connection subscription entities. Reason: ${ ex.message }`);
            return;
        }

        const jobId = this.getServiceId();
        let job: BlockchainListenerJob;
        try {
            job = await this.jobService.getById(jobId);
        } catch (ex) {
            logger.error(`cant job from DB. Reason: ${ ex.message }`);
            return;
        }

        try {
            await this.processFailedBlocks(transportConnections, job);
        } catch (ex) {
            logger.error(`cant process failed blocks. Reason: ${ ex.reason }`);
        }

        try {
            await this.executeHandlers(transportConnections, job);
        } catch (ex) {
            logger.error(`cant process new block(s). Reason: ${ ex.reason }`);
        }

        try {
            await this.jobService.setParams(job.id, job.params);
        } catch (ex) {
            logger.error(
                `FATAL ERROR: cant save updated job data. Some blocks may be processed again. Reason: ${ ex.message }`
            );
            return;
        }
    }

    private async executeHandlers(
        transportConnections: Array<Scheme.TransportConnectionSubscription>,
        job: BlockchainListenerJob
    ): Promise<void> {
        const handlersExecutions: Array<Promise<void>> = [];

        for (const transportConnection of transportConnections) {
            const blockchainId = transportConnection.blockchainId;
            const networkId = transportConnection.networkId;

            const blockchainService = this.blockchainRegistry.getByBlockchainInfo(
                blockchainId,
                networkId
            ) as BlockchainService<Scheme.BlockchainTransaction>;

            const lastBlockHeight = await blockchainService.getBlockHeight(transportConnection.id);

            try {
                this.validateJobData(job, transportConnection.id, lastBlockHeight);
            } catch (ex) {
                logger.error(`cant validate job data [${ this.getServiceId() }]. Reason: ${ ex.message }`);
                continue;
            }

            const lastProcessedBlock = job.params[transportConnection.id].lastProcessedBlock;

            for (let blockNo = lastProcessedBlock + 1; blockNo <= lastBlockHeight; blockNo++) {
                handlersExecutions.push(this.executeAllHandlersPerBlock(
                    lastBlockHeight,
                    blockNo,
                    transportConnection,
                    blockchainService,
                    job
                ));
            }
        }

        await Promise.all(handlersExecutions);
    }

    private async processFailedBlocks(
        transportConnections: Array<Scheme.TransportConnectionSubscription>,
        job: BlockchainListenerJob
    ) {
        const failedBlocksExecutors: Array<Promise<void | Array<void>>> = [];

        for (const transportConnection of transportConnections) {
            const blockchainId = transportConnection.blockchainId;
            const networkId = transportConnection.networkId;

            let blockchainService: BlockchainService<Scheme.BlockchainTransaction>;
            try {
                blockchainService = this.blockchainRegistry.getByBlockchainInfo(
                    transportConnection.blockchainId,
                    transportConnection.networkId
                ) as BlockchainService<Scheme.BlockchainTransaction>;
            } catch (ex) {
                logger.error(`BlockchainRegistry does not contain service for ${ blockchainId } ${ networkId }`);
                continue;
            }

            let lastBlockHeight: number;
            try {
                lastBlockHeight = await blockchainService.getBlockHeight(transportConnection.id);
            } catch (ex) {
                logger.error(`cant get last block height. Reason: ${ ex.message }`);
                continue;
            }

            try {
                this.validateJobData(job, transportConnection.id, lastBlockHeight);
            } catch (ex) {
                logger.error(`cant validate job data [${ this.getServiceId() }]. Reason: ${ ex.message }`);
                continue;
            }

            const transportConnectionData = job.params[transportConnection.id];

            // NOTICE: processes blocks which one or more handlers were not processed
            for (const handlerId of Object.keys(transportConnectionData.handlersData)) {
                const handlerData = transportConnectionData.handlersData[handlerId];

                if (!(handlerData.failedBlocks instanceof Array)) {
                    handlerData.failedBlocks = [];
                }
                const handlersBlocksHeights = handlerData.failedBlocks;
                handlerData.failedBlocks = [];

                const handler = this.handlers.find((h) => h.getHandlerId() === handlerId);
                if (!handler) {
                    logger.error(
                        `handler [${ handlerId }] was not found in handlers. It will be removed from job data`
                    );
                    delete transportConnectionData.handlersData[handlerId];
                    continue;
                }

                failedBlocksExecutors.push(
                    Promise.all(
                        handlersBlocksHeights.map(async (failedBlockHeight) => {
                            try {
                                const block =
                                    await blockchainService.getBlockByHeight(failedBlockHeight, transportConnection.id);
                                await this.executeOneHandlerPerBlock(
                                    handler,
                                    transportConnectionData.handlersData,
                                    block,
                                    lastBlockHeight,
                                    transportConnection,
                                    blockchainService
                                );
                            } catch (ex) {
                                logger.error(`cant process block [${ failedBlockHeight }]. Reason: ${ ex.reason }`);
                                handlerData.failedBlocks.push(failedBlockHeight);
                            }
                        })
                    )
                );
            }

            const failedBlocksHeights = transportConnectionData.failedBlocks || [];
            transportConnectionData.failedBlocks = [];

            failedBlocksExecutors.push(
                Promise.all(
                    failedBlocksHeights.map(async (failedBlockHeight) => {
                        try {
                            const block =
                                await blockchainService.getBlockByHeight(failedBlockHeight, transportConnection.id);

                            await Promise.all(
                                this.handlers.map((handler) => this.executeOneHandlerPerBlock(
                                    handler,
                                    transportConnectionData.handlersData,
                                    block,
                                    lastBlockHeight,
                                    transportConnection,
                                    blockchainService
                                ))
                            );
                        } catch (ex) {
                            logger.error(`cant process block [${ failedBlockHeight }]. Reason: ${ ex.reason }`);
                            transportConnectionData.failedBlocks.push(failedBlockHeight);
                        }
                    })
                )
            );
        }

        await Promise.all(failedBlocksExecutors);
    }

    private async executeAllHandlersPerBlock(
        lastBlockHeight: number,
        processingBlockHeight: number,
        transportConnection: Scheme.TransportConnectionSubscription,
        blockchainService: BlockchainService<Scheme.BlockchainTransaction>,
        job: BlockchainListenerJob
    ): Promise<void> {
        const transportConnectionData =
            job.params[transportConnection.id];
        try {
            const block: Scheme.BlockchainBlock<Scheme.BlockchainTransaction> =
                await blockchainService.getBlockByHeight(processingBlockHeight, transportConnection.id);

            await Promise.all(
                this.handlers.map((handler) => this.executeOneHandlerPerBlock(
                    handler,
                    transportConnectionData.handlersData,
                    block,
                    lastBlockHeight,
                    transportConnection,
                    blockchainService
                ))
            );
        } catch (ex) {
            logger.error(`cant process block [${ processingBlockHeight }]. Reason: ${ ex.reason }`);
            // NOTICE: means that block was not processed at all
            transportConnectionData.failedBlocks.push(processingBlockHeight);
        }
    }

    private async executeOneHandlerPerBlock(
        handler: BlockchainListenerHandler,
        handlersData: Hashtable<HandlerData>,
        block: Scheme.BlockchainBlock<Scheme.BlockchainTransaction>,
        lastBlockHeight: number,
        transportConnection: Scheme.TransportConnectionSubscription,
        blockchainService: BlockchainService<Scheme.BlockchainTransaction>
    ): Promise<void> {
        try {
            await handler.execute(
                lastBlockHeight,
                block,
                transportConnection,
                blockchainService
            );
        } catch (ex) {
            logger.error(`cant process block [${ block.height }]. Reason: ${ ex.reason }`);

            const handlerId = handler.getHandlerId();

            // NOTICE: defines data in transportConnection's data for current handler
            if (handlersData.hasOwnProperty(handlerId) === false) {
                handlersData[handlerId] = {
                    failedBlocks: []
                };
            }

            // NOTICE: means that one of the handlers was not processed a block
            handlersData[handler.getHandlerId()]
                .failedBlocks.push(block.height);
        }
    }

    private validateJobData(job: BlockchainListenerJob, transportConnectionId: string, lastBlockHeight: number) {
        // NOTICE: defines data in job entity for transportConnectionId configuration
        if (!job.params.hasOwnProperty(transportConnectionId)) {
            job.params[transportConnectionId] = {
                failedBlocks: [],
                handlersData: {},
                lastProcessedBlock: (lastBlockHeight - 1),
            };
        } else {
            if ((job.params[transportConnectionId].failedBlocks instanceof Array) === false) {
                job.params[transportConnectionId].failedBlocks = [];
            }
            if (!job.params[transportConnectionId].handlersData) {
                job.params[transportConnectionId].handlersData = {};
            }

            const lastProcessedBlockHeight = job.params[transportConnectionId].lastProcessedBlock;
            if (!lastProcessedBlockHeight && lastProcessedBlockHeight !== 0) {
                const message = `lastProcessedBlock from job data has invalid value [${ lastProcessedBlockHeight }]`;
                logger.error(message);
                throw new MultivestError(message);
            }
        }
    }
}
