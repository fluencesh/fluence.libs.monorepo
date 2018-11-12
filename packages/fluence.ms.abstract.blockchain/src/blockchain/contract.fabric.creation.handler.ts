// TODO: migrate to subscription model:
// https://applicature.atlassian.net/browse/FLC-210
// TODO: move to separate package
// https://applicature.atlassian.net/browse/FLC-209

// import { Hashtable, PluginManager } from '@applicature/core.plugin-manager';
// import { EthereumBlockchainService, EthereumTransaction } from '@fluencesh/fluence.lib.ethereum';
// import {
//     ContractService,
//     EthereumContractSubscriptionService,
//     Scheme,
// } from '@fluencesh/fluence.lib.services';
// import * as config from 'config';
// import { sha3 } from 'ethereumjs-util';
// import { EthereumBlockchainHandler } from './ethereum.blockchain.handler';

// interface FabricMethodConfigData {
//     name: string;
//     types: Array<string>;
//     minConfirmations: number;
// }

// export class ContractFabricCreationHandler extends EthereumBlockchainHandler {
//     private contractService: ContractService;

//     constructor(
//         pluginManager: PluginManager,
//         blockchainService: EthereumBlockchainService
//     ) {
//         super(pluginManager, blockchainService);

//         this.contractService =
//             pluginManager.getServiceByClass(ContractService) as ContractService;
//     }

//     public async processBlock(lastBlockHeight: number, block: Scheme.BlockchainBlock<EthereumTransaction>) {
//         const logs = await this.getLogsByBlockHeight(block.height);

//         const receivedContractsAddresses = logs
//             .map((log) => log.address)
//             .filter((address, index, addresses) => addresses.indexOf(address) === index);
//         const contracts = await this.contractService.listByAddresses(receivedContractsAddresses);

//         if (contracts.length === 0) {
//             return;
//         }

//         const projectIds = contracts.map((c) => c.projectId);
//         const projectsMap: Hashtable<Scheme.Project> = await this.loadProjectHashmapByIds(projectIds);

//         const eventMethodData = config.get<FabricMethodConfigData>('multivest.blockchain.fabricMethod');
//         const eventMethodSignature = `${eventMethodData.name}(${eventMethodData.types.join(',')})`;
//         const createContractTopic = this.attachPrefix((sha3(eventMethodSignature) as Buffer).toString('hex'));
//         const minConfirmations = eventMethodData.minConfirmations;

//         const webhookActions: Array<Scheme.WebhookActionItem> = [];
//         const createdAddresses: Array<string> = [];

//         const confirmations = lastBlockHeight - block.height;

//         for (const contract of contracts) {
//             const contractLogs = logs.filter((log) =>
//                 log.address === contract.address
//                 && log.topics.find((topic) => topic === createContractTopic)
//             );

//             for (const log of contractLogs) {
//                 const decoded = this.decodeData(eventMethodData.types, log.data);
//                 const contractAddress = this.attachPrefix(decoded[0]);

//                 if (!createdAddresses.find((address) => address === contractAddress)) {
//                     const project = projectsMap[contract.projectId];

//                     const createdContract = await this.contractService.createContract(
//                         contract.projectId,
//                         contractAddress,
//                         contract.abi
//                     );
//                     createdAddresses.push(createdContract.address);

//                     const params = {
//                         abi: createdContract.abi,
//                         address: createdContract.address,
//                         id: createdContract.id,
//                         isFabric: createdContract.isFabric,
//                         isPublic: createdContract.isPublic,
//                         projectId: createdContract.projectId,
//                     };

//                     const subscription = { minConfirmations, id: null } as Scheme.Subscription;

//                     const webhook = this.createWebhook(
//                         block,
//                         log.transactionHash,
//                         project,
//                         subscription,
//                         confirmations,
//                         params,
//                         log.address,
//                     );

//                     if (minConfirmations > confirmations) {
//                         await this.createBlockRecheck(
//                             subscription,
//                             block,
//                             confirmations,
//                             webhook
//                         );

//                         continue;
//                     }

//                     webhookActions.push(webhook);
//                 }
//             }
//         }

//         if (webhookActions.length) {
//             await this.webhookService.fill(webhookActions);
//         }
//     }

//     public getSubscriptionBlockRecheckType() {
//         return Scheme.SubscriptionBlockRecheckType.ContractFabricCreation;
//     }

//     protected getWebhookType() {
//         return Scheme.WebhookTriggerType.EthereumContractEvent;
//     }
// }
