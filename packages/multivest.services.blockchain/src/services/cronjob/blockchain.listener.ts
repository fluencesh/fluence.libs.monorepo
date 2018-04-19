import { PluginManager } from '@applicature/multivest.core';

import { BlockchainListener } from '@applicature-restricted/multivest.blockchain';

import { Scheme } from '../../types';
import { BlockchainService } from '../blockchain/blockchain.service';
import { JobService } from '../object/job.service';

export abstract class PopulatedBlockchainListener extends BlockchainListener {
    private jobService: JobService;

    constructor(
        pluginManager: PluginManager,
        blockchainService: BlockchainService,
        jobService: JobService,
        sinceBlock: number,
        minConfirmation = 0
    ) {
        // FIXME: type issue. BlockchainListener used class BlockchainService which was moved into this package
        super(pluginManager, blockchainService as any, sinceBlock, minConfirmation);

        this.jobService = this.jobService;
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
}
