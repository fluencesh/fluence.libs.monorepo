import { Block, Transaction } from '@applicature/multivest.core';
import {MultivestError, PluginManager, Service} from '@applicature/multivest.core';
import { BigNumber } from 'bignumber.js';
import { Errors } from '../../errors';
import { Scheme } from '../../types';
import { ClientService } from '../object/client.service';
import { ProjectService } from '../object/project.service';
import { TransactionHashSubscriptionService } from '../object/transaction.hash.subscription.service';
import { BlockchainTransportService } from './blockchain.transport.service';

export interface Signature {
    v: number;
    r: Buffer;
    s: Buffer;
}

export abstract class BlockchainService extends Service {
    protected network: string;
    protected blockChainTransportService: BlockchainTransportService;
    protected projectService: ProjectService;
    protected clientService: ClientService;
    protected transactionHashSubscriptionService: TransactionHashSubscriptionService;

    constructor(
        pluginManager: PluginManager,
        network: string,
        blockChainTransportService: BlockchainTransportService
    ) {
        super(pluginManager);

        if (!this.isValidNetwork(network)) {
            throw new MultivestError(Errors.WRONG_NETWORK);
        }

        this.network = network;
        this.blockChainTransportService = blockChainTransportService;

        this.projectService = pluginManager.getServiceByClass(ProjectService) as ProjectService;
        this.clientService = pluginManager.getServiceByClass(ClientService) as ClientService;
        this.transactionHashSubscriptionService =
            pluginManager.getServiceByClass(TransactionHashSubscriptionService) as TransactionHashSubscriptionService;
    }

    public abstract isValidNetwork(network: string): boolean;
    public abstract getSymbol(): string;
    public abstract getHDAddress(index: number): string;
    public abstract isValidAddress(address: string): boolean;
    public abstract signData(privateKey: Buffer, data: Buffer): Signature;
    public abstract signDataAndStringify(privateKey: Buffer, data: Buffer): string;
    public abstract signTransaction(privateKey: Buffer, txData: Transaction): string;

    public getBlockchainId(): string {
        return this.blockChainTransportService.getBlockchainId();
    }

    public getNetworkId(): string {
        return this.blockChainTransportService.getNetworkId();
    }

    public async getBlockHeight(): Promise<number> {
        return this.blockChainTransportService.getBlockHeight();
    }

    public async getBlockByHeight(blockHeight: number): Promise<Block> {
        return this.blockChainTransportService.getBlockByHeight(blockHeight);
    }

    public async getBlockByHash(blockHash: string): Promise<Block> {
        return this.blockChainTransportService.getBlockByHash(blockHash);
    }

    public async getTransactionByHash(txHash: string): Promise<Transaction> {
        return this.blockChainTransportService.getTransactionByHash(txHash);
    }

    public async sendTransaction(
        privateKey: Buffer,
        txData: Transaction,
        projectId?: string,
        minConfirmation?: number
    ): Promise<Transaction> {
        const txHex = await this.signTransaction(privateKey, txData);

        return this.sendRawTransaction(txHex, projectId, minConfirmation);
    }

    public async sendRawTransaction(
        txHex: string,
        projectId?: string,
        minConfirmation: number = 0 // THINK: where it should be set
    ): Promise<Transaction> {
        const tx = await this.blockChainTransportService.sendRawTransaction(txHex);

        if (projectId) {
            const project = await this.projectService.getById(projectId);
            const client = await this.clientService.getById(project.clientId);

            const isProjectActive = project.status === Scheme.ProjectStatus.Active;
            const isClientActive = client.status === Scheme.ClientStatus.Active;

            // THINK: is subscription should be created if (isProjectActive === false || isClientActive === false) ?
            await this.transactionHashSubscriptionService.createSubscription(
                project.clientId,
                project.id,
                this.getBlockchainId(),
                this.getNetworkId(),
                txHex,
                minConfirmation,
                isProjectActive && isClientActive,
                isProjectActive,
                isClientActive
            );
        }

        return tx;
    }

    public async getBalance(address: string, minConf: number): Promise<BigNumber> {
        return this.blockChainTransportService.getBalance(address, minConf);
    }
}
