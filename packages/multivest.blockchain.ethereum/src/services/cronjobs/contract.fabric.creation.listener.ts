import {
    BlockchainListener,
    ContractService,
    JobService,
    ProjectService,
    Scheme,
    WebhookActionItemObjectService,
} from '@applicature-restricted/multivest.services.blockchain';
import { Hashtable, PluginManager } from '@applicature/multivest.core';
import * as config from 'config';
import * as abi from 'ethereumjs-abi';
import { sha3 } from 'ethereumjs-util';
import { set } from 'lodash';
import { v1 as generateId } from 'uuid';
import { EthereumBlock, EthereumTopic, EthereumTopicFilter } from '../../types';
import { EthereumBlockchainService } from '../blockchain/ethereum';
import { EthereumBlockchainListener } from './ethereum.blockchain.listener';

interface FabricMethodConfigData {
    name: string;
    types: Array<string>;
}

export class ContractFabricCreationListener extends EthereumBlockchainListener {
    protected blockchainService: EthereumBlockchainService;
    protected contractService: ContractService;
    protected projectService: ProjectService;
    protected webhookService: WebhookActionItemObjectService;

    constructor(
        pluginManager: PluginManager,
        blockchainService: EthereumBlockchainService,
        jobService: JobService,
        sinceBlock: number,
        minConfirmation: number,
        processedBlockHeight: number = 0
    ) {
        super(pluginManager, blockchainService, jobService, sinceBlock, minConfirmation, processedBlockHeight);

        this.contractService = this.pluginManager.getServiceByClass(ContractService) as ContractService;
        this.projectService = this.pluginManager.getServiceByClass(ProjectService) as ProjectService;
        this.webhookService =
            this.pluginManager.getServiceByClass(WebhookActionItemObjectService) as WebhookActionItemObjectService;
    }

    public getJobId() {
        return `${ this.blockchainId }.${ this.networkId }.contract.fabric.creation.listener`;
    }

    public async processBlock(publishedBlockHeight: number, block: EthereumBlock): Promise<void> {
        const logs = await this.getLogsByBlockHeight(block.height);

        const receivedContractsAddresses = logs
            .map((log) => log.address)
            .filter((address, index, addresses) => addresses.indexOf(address) === index);
        const contracts = await this.contractService.listByAddresses(receivedContractsAddresses);

        if (contracts.length === 0) {
            return;
        }

        const projectsMap: Hashtable<Scheme.Project> = await this.getProjectMapByContracts(contracts);

        const eventMethodData = config.get<FabricMethodConfigData>('multivest.blockchain.ethereum.fabricMethod');
        const eventMethodSignature = `${eventMethodData.name}(${eventMethodData.types.join(',')})`;
        const createContractTopic = this.attachPrefix((sha3(eventMethodSignature) as Buffer).toString('hex'));

        const webhookActions: Array<Scheme.WebhookActionItem> = [];
        const createdAddresses: Array<string> = [];

        const confirmations = publishedBlockHeight - block.height;

        for (const contract of contracts) {
            const contractLogs = logs.filter((log) =>
                log.address === contract.address
                && log.topics.find((topic) => topic === createContractTopic)
            );

            for (const log of contractLogs) {
                const decoded = this.decodeData(eventMethodData.types, log.data);
                const contractAddress = this.attachPrefix(decoded[0]);

                if (!createdAddresses.find((address) => address === contractAddress)) {
                    const createdContract = await this.contractService.createContract(
                        contract.projectId,
                        contractAddress,
                        contract.abi
                    );
                    createdAddresses.push(createdContract.address);

                    const relatedProject = projectsMap[createdContract.projectId];

                    webhookActions.push(this.prepareWebhookItem(
                        relatedProject,
                        block,
                        confirmations,
                        log.transactionHash,
                        createContractTopic,
                        createdContract
                    ));
                }
            }
        }

        if (webhookActions.length) {
            await this.webhookService.fill(webhookActions);
        }
    }

    private async getProjectMapByContracts(
        contracts: Array<Scheme.ContractScheme>
    ): Promise<Hashtable<Scheme.Project>> {
        const projectsIds = contracts.map((contract) => contract.projectId);
        const projects = await this.projectService.listByIds(projectsIds);

        return projects.reduce((map, project) => set(map, project.id, project), {} as Hashtable<Scheme.Project>);
    }

    private prepareWebhookItem(
        project: Scheme.Project,
        block: EthereumBlock,
        confirmations: number,
        txHash: string,
        topic: string,
        createdContract: Scheme.ContractScheme
    ): Scheme.WebhookActionItem {
        return {
            id: generateId(),

            clientId: project.clientId,
            projectId: project.id,
            webhookUrl: project.webhookUrl,

            blockChainId: this.blockchainService.getBlockchainId(),
            networkId: this.blockchainService.getNetworkId(),

            blockHash: block.hash,
            blockHeight: block.height,
            blockTime: block.time,

            minConfirmations: project.txMinConfirmations,
            confirmations,

            txHash,
            refId: createdContract.id,

            type: Scheme.WebhookTriggerType.EthereumContractEvent,

            eventId: topic,
            params: {
                id: createdContract.id,
                address: createdContract.address,
                abi: createdContract.abi,
                isFabric: createdContract.isFabric,
                isPublic: createdContract.isPublic,
                projectId: createdContract.projectId,
            } as Hashtable<any>,

            failedCount: 0,
            lastFailedAt: null,

            fails: [],

            status: Scheme.WebhookReportItemStatus.Created,

            createdAt: new Date()
        } as Scheme.WebhookActionItem;
    }
}
