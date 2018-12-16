import { PluginManager, Service, Hashtable, MultivestError } from '@applicature/synth.plugin-manager';
import {
    BlockchainRegistryService,
    TransportConnectionSubscriptionService,
    Scheme,
    JobService,
    BlockchainService,
    BlockchainTransportProvider,
    ManagedBlockchainTransport,
} from '@fluencesh/fluence.lib.services';
import * as logger from 'winston';
import { BlockchainListenerJob, HandlerData } from '../types';
import { BlockchainListenerHandler } from './blockchain.listener.handler';

export class BlockchainListener<
    Transaction extends Scheme.BlockchainTransaction,
    Block extends Scheme.BlockchainBlock<Transaction>,
    Provider extends BlockchainTransportProvider<Transaction, Block>,
    ManagedBlockchainTransportService extends ManagedBlockchainTransport<Transaction, Block, Provider>
> extends Service {
    private readonly blockchainRegistry: BlockchainRegistryService;
    private readonly blockchainId: string;

    private readonly tcsService: TransportConnectionSubscriptionService;
    private readonly jobService: JobService;

    private readonly handlers: Array<BlockchainListenerHandler<
        Transaction,
        Block,
        Provider,
        ManagedBlockchainTransportService
    >>;

    constructor(
        pluginManager: PluginManager,
        blockchainId: string,

        handlers: Array<BlockchainListenerHandler<
            Transaction,
            Block,
            Provider,
            ManagedBlockchainTransportService
        >>
    ) {
        super(pluginManager);

        this.blockchainId = blockchainId;
        this.handlers = handlers;

        this.blockchainRegistry = this.pluginManager.getServiceByClass(BlockchainRegistryService);
        this.tcsService = this.pluginManager.getServiceByClass(TransportConnectionSubscriptionService);
        this.jobService = this.pluginManager.getServiceByClass(JobService);
    }

    public getServiceId() {
        return `blockchain.${ this.blockchainId }.listener`;
    }

    public async execute(message: Scheme.TransportConnectionJobData) {
        let transportConnectionSubscription: Scheme.TransportConnectionSubscription;
        try {
            transportConnectionSubscription = await this.tcsService.getByIdAndStatus(
                message.transportConnectionId,
                Scheme.TransportConnectionSubscriptionStatus.Subscribed
            );

            if (transportConnectionSubscription === null) {
                logger.info(
                    `transport connection [${ message.transportConnectionId }] hasn't active subscriptions`
                );
                return;
            }
        } catch (ex) {
            logger.error(
                `cant transport connection subscription [${ message.transportConnectionId }] from DB.`
                + `Reason: ${ ex.message }`
            );
            return;
        }

        let job: BlockchainListenerJob;
        try {
            job = await this.getJobSafely(transportConnectionSubscription);
        } catch (ex) {
            logger.error(`cant job from DB. Reason: ${ ex.message }`);
            return;
        }

        let blockchainService: BlockchainService<
            Transaction,
            Block,
            Provider,
            ManagedBlockchainTransportService
        >;
        try {
            blockchainService = this.blockchainRegistry.getByBlockchainInfo(
                transportConnectionSubscription.blockchainId,
                transportConnectionSubscription.networkId
            );
        } catch (ex) {
            logger.error(
                'BlockchainRegistry does not contain service for '
                + `${ transportConnectionSubscription.blockchainId } ${ transportConnectionSubscription.networkId }`
            );
            return;
        }

        let lastBlockHeight: number;
        try {
            lastBlockHeight = await blockchainService.getBlockHeight(transportConnectionSubscription.id);
        } catch (ex) {
            logger.error(`cant get last block height. Reason: ${ ex.message }`);
            return;
        }

        try {
            this.initJobData(job, lastBlockHeight);
        } catch (ex) {
            logger.error(`cant init job data. Reason: ${ ex.message }`);
            return;
        }

        try {
            await this.processFailedBlocks(blockchainService, lastBlockHeight, transportConnectionSubscription, job);
        } catch (ex) {
            logger.error(`cant process failed blocks. Reason: ${ ex.reason }`);
        }

        try {
            await this.executeHandlers(blockchainService, lastBlockHeight, transportConnectionSubscription, job);
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

    private async getJobSafely(
        transportConnectionSubscription: Scheme.TransportConnectionSubscription
    ): Promise<BlockchainListenerJob> {
        const jobId = this.getAgendaJobId(transportConnectionSubscription);

        logger.info(`tying to get job [${ jobId }]...`);

        let job: BlockchainListenerJob = await this.jobService.getById(jobId) as BlockchainListenerJob;
        if (!job) {
            logger.debug(`job [${ this.getServiceId() }] was not found in DB. trying to create new one.`);
            job = await this.jobService.createJob(jobId, {}) as BlockchainListenerJob;
        } else {
            logger.debug(`job [${ this.getServiceId() }] was found in DB. Job: ${ JSON.stringify(job) }`);
        }

        return job as BlockchainListenerJob;
    }

    private async executeHandlers(
        blockchainService: BlockchainService<
            Transaction,
            Block,
            Provider,
            ManagedBlockchainTransportService
        >,
        lastBlockHeight: number,
        transportConnectionSubscription: Scheme.TransportConnectionSubscription,
        job: BlockchainListenerJob
    ): Promise<void> {
        const handlersExecutions: Array<Promise<void>> = [];

        const lastProcessedBlock = job.params.lastProcessedBlock;

        for (let blockNo = lastProcessedBlock + 1; blockNo <= lastBlockHeight; blockNo++) {
            handlersExecutions.push(this.executeAllHandlersPerBlock(
                lastBlockHeight,
                blockNo,
                transportConnectionSubscription,
                blockchainService,
                job
            ));
        }

        await Promise.all(handlersExecutions);

        job.params.lastProcessedBlock = lastBlockHeight;
    }

    private async processFailedBlocks(
        blockchainService: BlockchainService<
            Transaction,
            Block,
            Provider,
            ManagedBlockchainTransportService
        >,
        lastBlockHeight: number,
        transportConnectionSubscription: Scheme.TransportConnectionSubscription,
        job: BlockchainListenerJob
    ) {
        const transportConnectionData = job.params;

        const failedBlocksExecutors: Array<Promise<void | Array<void>>> = [];
        const cachedBlocks: Hashtable<Block> = {};

        // NOTICE: processes blocks which one or more handlers were not processed
        for (const handlerId of Object.keys(transportConnectionData.handlersData)) {
            const handlerData = transportConnectionData.handlersData[handlerId];

            if (!(handlerData.failedBlocks instanceof Array)) {
                handlerData.failedBlocks = [];
            }
            const handlersFailedBlocksHeights = handlerData.failedBlocks;
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
                    handlersFailedBlocksHeights.map(async (failedBlockHeight) => {
                        let block: Block;
                        try {
                            if (cachedBlocks.hasOwnProperty(failedBlockHeight.toString())) {
                                block = cachedBlocks[failedBlockHeight.toString()];
                            } else {
                                block = await blockchainService.getBlockByHeight(
                                    failedBlockHeight,
                                    transportConnectionSubscription.id
                                );

                                cachedBlocks[failedBlockHeight.toString()] = block;
                            }
                        } catch (ex) {
                            logger.error(`cant process block [${ failedBlockHeight }]. Reason: ${ ex.reason }`);
                            handlerData.failedBlocks.push(failedBlockHeight);
                            return;
                        }

                        await this.executeOneHandlerPerBlock(
                            handler,
                            transportConnectionData.handlersData,
                            block,
                            lastBlockHeight,
                            transportConnectionSubscription,
                            blockchainService
                        );
                    })
                )
            );
        }

        const failedBlocksHeights = transportConnectionData.failedBlocks;
        transportConnectionData.failedBlocks = [];

        failedBlocksExecutors.push(
            Promise.all(
                failedBlocksHeights.map(async (failedBlockHeight) => {
                    let block: Block;
                    try {
                        if (cachedBlocks.hasOwnProperty(failedBlockHeight.toString())) {
                            block = cachedBlocks[failedBlockHeight.toString()];
                        } else {
                            block = await blockchainService.getBlockByHeight(
                                failedBlockHeight,
                                transportConnectionSubscription.id
                            );

                            cachedBlocks[failedBlockHeight.toString()] = block;
                        }
                    } catch (ex) {
                        logger.error(`cant process block [${ failedBlockHeight }]. Reason: ${ ex.reason }`);
                        transportConnectionData.failedBlocks.push(failedBlockHeight);
                        return;
                    }

                    await Promise.all(
                        this.handlers.map((handler) => this.executeOneHandlerPerBlock(
                            handler,
                            transportConnectionData.handlersData,
                            block,
                            lastBlockHeight,
                            transportConnectionSubscription,
                            blockchainService
                        ))
                    );
                })
            )
        );

        await Promise.all(failedBlocksExecutors);
    }

    private async executeAllHandlersPerBlock(
        lastBlockHeight: number,
        processingBlockHeight: number,
        transportConnection: Scheme.TransportConnectionSubscription,
        blockchainService: BlockchainService<
            Transaction,
            Block,
            Provider,
            ManagedBlockchainTransportService
        >,
        job: BlockchainListenerJob
    ): Promise<void> {
        const transportConnectionData = job.params;
        try {
            const block: Block =
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
        handler: BlockchainListenerHandler<
            Transaction,
            Block,
            Provider,
            ManagedBlockchainTransportService
        >,
        handlersData: Hashtable<HandlerData>,
        block: Block,
        lastBlockHeight: number,
        transportConnection: Scheme.TransportConnectionSubscription,
        blockchainService: BlockchainService<
            Transaction,
            Block,
            Provider,
            ManagedBlockchainTransportService
        >
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

    private initJobData(job: BlockchainListenerJob, lastBlockHeight: number) {
        // NOTICE: defines data in job entity
        if ((job.params.failedBlocks instanceof Array) === false) {
            job.params.failedBlocks = [];
        }

        if (!job.params.handlersData) {
            job.params.handlersData = {};
        }

        const lastProcessedBlockHeight = job.params.lastProcessedBlock;
        if (!lastProcessedBlockHeight && lastProcessedBlockHeight !== 0) {
            job.params.lastProcessedBlock = lastBlockHeight - 1;
        }
    }

    private getAgendaJobId(transportConnectionSubscription: Scheme.TransportConnectionSubscription) {
        return `${ this.getServiceId() }.${ transportConnectionSubscription.id }`;
    }
}
