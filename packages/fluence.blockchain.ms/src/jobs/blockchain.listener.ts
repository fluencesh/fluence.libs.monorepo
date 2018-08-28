import { Job, PluginManager } from '@fluencesh/multivest.core';
import { BlockchainService } from '@fluencesh/multivest.services.blockchain';
import * as AWS from 'aws-sdk';
import * as config from 'config';
import { BlockchainHandler, BlockchainMonitor } from '../blockchain';

AWS.config.update({ region: config.get('aws.region') });

let blockchainId: string = null;
let networkId: string = null;

export class BlockchainListenerJob extends Job {
    protected blockchainSqsPublisher: BlockchainMonitor;

    constructor(
        pluginManager: PluginManager,
        blockchainService: BlockchainService,
        sinceBlock: number,
        handlers: Array<BlockchainHandler>,
    ) {
        blockchainId = blockchainService.getBlockchainId();
        networkId = blockchainService.getNetworkId();

        super(pluginManager);
        
        this.blockchainSqsPublisher = new BlockchainMonitor(
            pluginManager,
            blockchainService,
            sinceBlock,
            handlers
        );
    }

    public getJobId() {
        return `blockchain.sqs.publisher.job.${ blockchainId }.${ networkId }`;
    }

    public async execute() {
        await this.blockchainSqsPublisher.execute();
    }
}
