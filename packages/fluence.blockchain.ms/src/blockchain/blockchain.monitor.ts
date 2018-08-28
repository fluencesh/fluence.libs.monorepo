import { Block, PluginManager } from '@fluencesh/multivest.core';
import { Plugin as MongoPlugin } from '@fluencesh/multivest.mongodb';
import {
    BlockchainService,
    DaoIds,
    JobDao,
    Scheme
} from '@fluencesh/multivest.services.blockchain';
import * as AWS from 'aws-sdk';
import * as config from 'config';
import * as logger from 'winston';
import { BlockchainHandler } from './blockchain.handler';

AWS.config.update({ region: config.get('aws.region') });

export class BlockchainMonitor {
    protected blockchainService: BlockchainService;
    protected pluginManager: PluginManager;

    private jobDao: JobDao;
    private job: Scheme.Job;
    private sinceBlock: number;

    private handlers: Array<BlockchainHandler>;

    private get networkId() {
        return this.blockchainService.getNetworkId();
    }

    private get blockchainId() {
        return this.blockchainService.getBlockchainId();
    }

    public get jobId() {
        return `blockchain.monitor.${ this.blockchainId }.${ this.networkId }`;
    }

    constructor(
        pluginManager: PluginManager,
        blockchainService: BlockchainService,
        sinceBlock: number,
        handlers: Array<BlockchainHandler>,
    ) {
        this.pluginManager = pluginManager;
        this.blockchainService = blockchainService;

        // NOTICE: if job was executed early and DB contains data about it,
        // then `this.processedBlockHeight` will be overridden
        // see method `dbSync` for more info
        this.sinceBlock = sinceBlock;
        this.handlers = handlers;
    }

    public async execute() {
        let lastPublishedBlockHeight: number;
        try {
            lastPublishedBlockHeight = await this.blockchainService.getBlockHeight();
        } catch (ex) {
            logger.error(`${ this.jobId }: Can't load last published block number. reason: ${ ex.message }`, ex);

            return;
        }

        await this.downloadCacheFromDb();

        await this.processBlocks(this.job.params.processedBlockHeight + 1, lastPublishedBlockHeight);

        this.job.params.processedBlockHeight = lastPublishedBlockHeight;

        await this.uploadCacheToDb();
    }

    private async downloadCacheFromDb() {
        if (!this.jobDao) {
            logger.debug('trying to get JobDao from Mongo Plugin...');

            const mongoPlugin = this.pluginManager.get('mongodb') as any as MongoPlugin;
            this.jobDao = await mongoPlugin.getDao(DaoIds.Job) as JobDao;

            logger.debug('JobDao was successfully ejected from Mongo Plugin');
        } else {
            logger.debug('JobDao was got from cache');
        }

        if (!this.job) {
            logger.debug('Trying to get job from DB...');
            this.job = await this.jobDao.getById(this.jobId);

            if (!this.job) {
                logger.debug('Job was not found in DB. Trying to create job in DB...');
                this.job = await this.jobDao.createJob(this.jobId, {
                    failedBlocksNumbers: [],
                    processedBlockHeight: this.sinceBlock
                });
                logger.debug('Job was created in DB');
            } else {
                logger.debug('Job was got from cache');
            }
        }

        logger.debug(
            'Job\'s data: '
            + `processedBlockHeight - ${ this.job.params.processedBlockHeight }`
            + `failedBlocksNumbers - ${ this.job.params.failedBlocksNumbers }`
        );
    }

    private async uploadCacheToDb() {
        if (!this.jobDao) {
            logger.debug('trying to get JobDao from Mongo Plugin...');

            const mongoPlugin = this.pluginManager.get('mongodb') as any as MongoPlugin;
            this.jobDao = await mongoPlugin.getDao(DaoIds.Job) as JobDao;

            logger.debug('JobDao was successfully ejected from Mongo Plugin');
        } else {
            logger.debug('JobDao was got from cache');
        }

        logger.debug(
            'Trying to update job\'s data...'
            + `processedBlockHeight - ${ this.job.params.processedBlockHeight }`
            + `failedBlocksNumbers - ${ this.job.params.failedBlocksNumbers }`
        );

        await this.jobDao.setParams(this.jobId, {
            failedBlocksNumbers: this.job.params.failedBlocksNumbers,
            processedBlockHeight: this.job.params.processedBlockHeight,
        });
    }

    private async processBlocks(fromBlock: number, toBlock: number): Promise<void> {
        const blockLoaders: Array<Promise<Block>> = [];

        if (this.job.params.failedBlocksNumbers.length) {
            logger.info(
                `${ this.jobId }: Trying to reload blocks which were not loaded on last iterations: `
                + this.job.params.failedBlocksNumbers.join(', ')
            );
    
            let blockNo: number = this.job.params.failedBlocksNumbers.pop();
            while (blockNo !== undefined) {
                blockLoaders.push(this.loadBlock(blockNo));
                blockNo = this.job.params.failedBlocksNumbers.pop();
            }
        }

        logger.info(`${ this.jobId }: processing blocks...`);
        logger.info(`${ this.jobId }: Last processed block - ${ this.job.params.processedBlockHeight }`);
        logger.info(`${ this.jobId }: Last published block - ${ toBlock }`);

        for (let blockNo = fromBlock; blockNo <= toBlock; blockNo++) {
            blockLoaders.push(this.loadBlock(blockNo));
        }

        const blocks = await Promise.all(blockLoaders);

        await Promise.all(
            blocks
                .filter((block) => block !== null)
                .map((block) =>
                    Promise.all(
                        this.handlers.map((handler) =>
                            handler.processBlockAndUnconfirmedBlocks(toBlock, block)
                        )
                    )
                )
        );
    }

    private async loadBlock(blockNo: number): Promise<Block> {
        try {
            const block = await this.blockchainService.getBlockByHeight(blockNo);

            logger.debug(`Block [${ blockNo }] was successfully loaded`);

            return block;
        } catch (ex) {
            logger.error(
                `Can't load block [${ blockNo }]. `
                + 'On next iteration of cron job it will be reloaded'
            );
            this.job.params.failedBlocksNumbers.push(blockNo);

            return null;
        }
    }
}
