import { Hashtable, PluginManager } from '@fluencesh/multivest.core';
import {
    JobService, OraclizeSubscriptionService, ProjectService, Scheme
} from '@fluencesh/multivest.services.blockchain';
import { set } from 'lodash';
import { v1 as generateId } from 'uuid';
import {
    EthereumBlock,
    EthereumTopic
} from '../../types';
import { EthereumBlockchainService } from '../blockchain/ethereum';
import { EthereumBlockchainListener } from './ethereum.blockchain.listener';

export class OraclizeJob extends EthereumBlockchainListener {
    private oraclizeService: OraclizeSubscriptionService;
    private projectService: ProjectService;

    constructor(
        pluginManager: PluginManager,
        blockchainService: EthereumBlockchainService,
        jobService: JobService,
        sinceBlock: number,
        minConfirmation: number,
        processedBlockHeight: number = 0
    ) {
        super(pluginManager, blockchainService, jobService, sinceBlock, minConfirmation, processedBlockHeight);

        this.oraclizeService =
            pluginManager.getServiceByClass(OraclizeSubscriptionService) as OraclizeSubscriptionService;
        this.projectService = pluginManager.getServiceByClass(ProjectService) as ProjectService;
    }

    public getJobId(): string {
        return 'oraclize.job';
    }

    public async processBlock(publishedBlockHeight: number, block: EthereumBlock) {
        const logs = await this.getLogsByBlockHeight(block.height);

        const eventsList = logs.reduce((events: Array<string>, log) => events.concat(log.topics), []);

        const subscriptions = await this.oraclizeService.listByEventHashesAndStatus(eventsList, true);
        if (!subscriptions.length) {
            return;
        }

        const projectIds = subscriptions.map((subscription) => subscription.projectId);
        const projects = await this.projectService.listByIds(projectIds);
        const projectMap: Hashtable<Scheme.Project> =
            projects.reduce((map, project) => set(map, project.id, project), {});

        const confirmations = publishedBlockHeight - block.height;
        const webhookActions: Array<Scheme.WebhookActionItem> = [];

        subscriptions.forEach((subscription) => {
            const project = projectMap[subscription.projectId];
            const relatedLogs = logs.filter((log) =>
                !!log.topics.find((topic) => topic === subscription.eventHash)
            );

            relatedLogs.forEach((log) => {
                const webhookAction = this.prepareWebhookItem(
                    project,
                    block,
                    confirmations,
                    log,
                    subscription
                );

                webhookActions.push(webhookAction);
            });
        });

        await this.webhookService.fill(webhookActions);
    }

    private prepareWebhookItem(
        project: Scheme.Project,
        block: EthereumBlock,
        confirmations: number,
        log: EthereumTopic,
        subscription: Scheme.OraclizeSubscription
    ): Scheme.WebhookActionItem {
        const decodedData = this.decodeData(subscription.eventInputTypes, log.data);

        return {
            id: generateId(),

            clientId: project.clientId,
            projectId: project.id,
            webhookUrl: subscription.webhookUrl,

            blockChainId: this.blockchainService.getBlockchainId(),
            networkId: this.blockchainService.getNetworkId(),

            blockHash: block.hash,
            blockHeight: block.height,
            blockTime: block.time,

            minConfirmations: project.txMinConfirmations,
            confirmations,

            txHash: log.transactionHash,
            refId: subscription.id,

            type: Scheme.WebhookTriggerType.OraclizeSubscription,

            eventId: subscription.eventHash,
            params: {
                decodedData,
            } as Hashtable<any>,

            failedCount: 0,
            lastFailedAt: null,

            fails: [],

            status: Scheme.WebhookReportItemStatus.Created,

            createdAt: new Date()
        } as Scheme.WebhookActionItem;
    }
}
