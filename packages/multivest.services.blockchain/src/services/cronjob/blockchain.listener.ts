import {
    Block,
    Dao,
    Hashtable,
    Job,
    PluginManager,
    Recipient,
    Transaction,
} from '@applicature/multivest.core';

import { BigNumber } from 'bignumber.js';
import * as logger from 'winston';
import { WebhookMetric } from '../../metrics/webhook.metric';
import { Scheme } from '../../types';
import { BlockchainService } from '../blockchain/blockchain.service';
import { JobService } from '../object/job.service';
import { WebhookActionItemObjectService } from '../object/webhook.action.service';

export abstract class BlockchainListener extends Job {
    protected blockchainService: BlockchainService;
    protected sinceBlock: number;
    protected minConfirmation: number;
    protected processedBlockHeight: number;
    protected webhookService: WebhookActionItemObjectService;
    private jobService: JobService;

    constructor(
        pluginManager: PluginManager,
        blockchainService: BlockchainService,
        jobService: JobService,
        sinceBlock: number,
        minConfirmation: number = 0,
        processedBlockHeight: number = 0
    ) {
        super(pluginManager);

        this.blockchainService = blockchainService;
        this.jobService = jobService;
        this.sinceBlock = sinceBlock;
        this.blockchainService = blockchainService;
        this.minConfirmation = minConfirmation;
        this.processedBlockHeight = processedBlockHeight;

        this.webhookService =
            pluginManager.getServiceByClass(WebhookActionItemObjectService) as WebhookActionItemObjectService;
    }

    public async init() {
        return Promise.resolve();
    }

    public async getProcessedBlock(): Promise<number> {
        const jobId = this.getJobId();
        let job = await this.jobService.getById(jobId);

        if (!job) {
            job = await this.jobService.createJob(jobId, { processedBlockHeight: this.sinceBlock }) as Scheme.Job;
        }

        return job.params.processedBlockHeight;
    }

    public async execute() {
        let processingBlock;

        const processedBlockHeight = await this.getProcessedBlock();

        if (processedBlockHeight) {
            processingBlock = (new BigNumber(this.processedBlockHeight).add(1)).toNumber();
        }
        else {
            processingBlock = (new BigNumber(this.sinceBlock).add(1)).toNumber();
        }

        const publicBlockHeight = await this.blockchainService.getBlockHeight();

        await this.processBlocks(processingBlock, publicBlockHeight);
    }

    protected abstract async processBlock(publishedBlockHeight: number, block: any): Promise<void>;

    protected async processBlocks(processSinceBlock: number, publishedBlockHeight: number) {
        const jobId = this.getJobId();
        logger.info(`${jobId}: processing blocks`, {
            processSinceBlock,
            publishedBlockHeight,
        });

        for (let processingBlock = processSinceBlock; processingBlock < publishedBlockHeight; processingBlock += 1) {

            const block = await this.blockchainService.getBlockByHeight(processingBlock);

            const blockNumber = block.height;
            const blockTime = block.time;

            if ((publishedBlockHeight - blockNumber) < this.minConfirmation) {
                logger.info(`${jobId}: skipping block, because it has less confirmations than expected`, {
                    minConfirmations: this.minConfirmation,
                    skippingBlock: blockNumber,
                });

                break;
            }

            logger.info(`${jobId}: processing block`, {
                blockHeight: blockNumber,
                blockTime,
            });

            await this.processBlock(publishedBlockHeight, block);

            logger.info(`${jobId}: processed job`, {
                blockHeight: blockNumber,
                blockTime,
            });

            await this.touch();
        }
    }

    private extractRecipientTransactionPairs(block: Block) {
        const mapping = {} as Hashtable<
            Array<{
                recipient: Recipient;
                transaction: Transaction;
            }>
        >;

        for (const transaction of block.transactions) {
            for (const recipient of transaction.to) {
                    if (!Object.prototype.hasOwnProperty.call(mapping, recipient.address)) {
                        mapping[recipient.address] = [];
                    }
                    mapping[recipient.address].push({
                        recipient,
                        transaction,
                    });
            }
        }

        return mapping;
    }
}
