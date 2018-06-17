import { Block, Transaction } from '@applicature/multivest.core';
import {MultivestError, PluginManager, Service} from '@applicature/multivest.core';
import { BigNumber } from 'bignumber.js';
import { Errors } from '../../errors';
import { Scheme } from '../../types';
import { ClientService } from '../object/client.service';
import { ProjectService } from '../object/project.service';
import { TransactionHashSubscriptionService } from '../object/transaction.hash.subscription.service';
import { BlockchainTransport } from '../transports/blockchain.transport';

export interface Signature {
    v: number;
    r: Buffer;
    s: Buffer;
}

export abstract class BlockchainService extends Service {
    protected blockchainTransport: BlockchainTransport;
    protected projectService: ProjectService;
    protected clientService: ClientService;
    protected transactionHashSubscriptionService: TransactionHashSubscriptionService;

    constructor(
        pluginManager: PluginManager,
        blockchainTransport: BlockchainTransport
    ) {
        super(pluginManager);

        if (!this.isValidNetwork(blockchainTransport.getNetworkId())) {
            throw new MultivestError(Errors.WRONG_NETWORK);
        }

        this.blockchainTransport = blockchainTransport;

        this.projectService = pluginManager.getServiceByClass(ProjectService) as ProjectService;
        this.clientService = pluginManager.getServiceByClass(ClientService) as ClientService;
        this.transactionHashSubscriptionService =
            pluginManager.getServiceByClass(TransactionHashSubscriptionService) as TransactionHashSubscriptionService;
    }

    public abstract isValidNetwork(network: string): boolean;
    public abstract getSymbol(): string;
    public abstract getHDAddress(index: number): Promise<string>;
    public abstract isValidAddress(address: string): boolean;
    public abstract signData(privateKey: Buffer, data: Buffer): Signature;
    public abstract signDataAndStringify(privateKey: Buffer, data: Buffer): string;
    public abstract signTransaction(privateKey: Buffer, txData: Transaction): string;

    public getBlockchainId(): string {
        return this.blockchainTransport.getBlockchainId();
    }

    public getNetworkId(): string {
        return this.blockchainTransport.getNetworkId();
    }

    public async getBlockHeight(): Promise<number> {
        return this.blockchainTransport.getBlockHeight();
    }

    public async getBlockByHeight(blockHeight: number): Promise<Block> {
        return this.blockchainTransport.getBlockByHeight(blockHeight);
    }

    public async getBlockByHash(blockHash: string): Promise<Block> {
        return this.blockchainTransport.getBlockByHash(blockHash);
    }

    public async getTransactionByHash(txHash: string): Promise<Transaction> {
        return this.blockchainTransport.getTransactionByHash(txHash);
    }

    public async sendTransaction(
        privateKey: Buffer,
        txData: Transaction,
        projectId?: string
    ): Promise<Transaction> {
        const txHex = await this.signTransaction(privateKey, txData);

        return this.sendRawTransaction(txHex, projectId);
    }

    public async sendRawTransaction(
        txHex: string,
        projectId?: string
    ): Promise<Transaction> {
        const tx = await this.blockchainTransport.sendRawTransaction(txHex);

        if (projectId) {
            const project = await this.projectService.getById(projectId);
            const client = await this.clientService.getById(project.clientId);

            const isProjectActive = project.status === Scheme.ProjectStatus.Active;
            const isClientActive = client.status === Scheme.ClientStatus.Active;

            if (isProjectActive && isClientActive) {
                await this.transactionHashSubscriptionService.createSubscription(
                    project.clientId,
                    project.id,
                    this.getBlockchainId(),
                    this.getNetworkId(),
                    txHex,
                    project.txMinConfirmations
                );
            }
        }

        return tx;
    }

    public async getBalance(address: string, minConf: number): Promise<BigNumber> {
        return this.blockchainTransport.getBalance(address, minConf);
    }
}
