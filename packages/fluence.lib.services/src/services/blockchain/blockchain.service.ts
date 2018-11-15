import {
    MultivestError,
    PluginManager,
    Service,
} from '@applicature-private/core.plugin-manager';
import { BigNumber } from 'bignumber.js';
import { Errors } from '../../errors';
import { Scheme } from '../../types';
import { ClientService } from '../object/client.service';
import { ProjectService } from '../object/project.service';
import { TransactionHashSubscriptionService } from '../object/transaction.hash.subscription.service';
import { BlockchainTransportProvider, ManagedBlockchainTransport } from '../transports';

export interface Signature {
    v: number;
    r: Buffer;
    s: Buffer;
}

export abstract class BlockchainService<
    Transaction extends Scheme.BlockchainTransaction,
    Block extends Scheme.BlockchainBlock<Transaction>,
    Provider extends BlockchainTransportProvider<Transaction, Block>,
    ManagedBlockchainTransportService extends ManagedBlockchainTransport<Transaction, Block, Provider>
> extends Service {
    protected blockchainTransport: ManagedBlockchainTransportService;
    protected projectService: ProjectService;
    protected clientService: ClientService;
    protected transactionHashSubscriptionService: TransactionHashSubscriptionService;

    constructor(
        pluginManager: PluginManager,
        blockchainTransport: ManagedBlockchainTransportService
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
    public abstract getHDAddress(index: number, transportConnectionId: string): Promise<string>;
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

    public getStatistic(): Scheme.ManagedBlockchainTransportStatistic {
        return this.blockchainTransport.getStatistic();
    }

    public async getBlockHeight(transportConnectionId: string): Promise<number> {
        return this.blockchainTransport.getBlockHeight(transportConnectionId);
    }

    public async getBlockByHeight(
        blockHeight: number,
        transportConnectionId: string
    ) {
        return this.blockchainTransport.getBlockByHeight(blockHeight, transportConnectionId);
    }

    public async getBlockByHash(
        blockHash: string,
        transportConnectionId: string
    ) {
        return this.blockchainTransport.getBlockByHash(blockHash, transportConnectionId);
    }

    public async getTransactionByHash(
        txHash: string,
        transportConnectionId: string
    ): Promise<Transaction> {
        return this.blockchainTransport.getTransactionByHash(txHash, transportConnectionId);
    }

    public async sendTransaction(
        privateKey: Buffer,
        txData: Transaction,
        transportConnectionId: string,
        projectId?: string
    ): Promise<Transaction> {
        const txHex = await this.signTransaction(privateKey, txData);

        return this.sendRawTransaction(txHex, transportConnectionId, projectId);
    }

    public async sendRawTransaction(
        txHex: string,
        transportConnectionId: string,
        projectId?: string
    ): Promise<Transaction> {
        const tx = await this.blockchainTransport.sendRawTransaction(txHex, transportConnectionId);

        if (projectId) {
            const project = await this.projectService.getById(projectId);
            const client = await this.clientService.getById(project.clientId);

            const isProjectActive = project.status === Scheme.ProjectStatus.Active;
            const isClientActive = client.status === Scheme.ClientStatus.Active;

            if (isProjectActive && isClientActive) {
                await this.transactionHashSubscriptionService.createSubscription(
                    project.clientId,
                    project.id,
                    transportConnectionId,
                    txHex,
                    project.txMinConfirmations
                );
            }
        }

        return tx;
    }

    public async getBalance(address: string, minConf: number, transportConnectionId: string): Promise<BigNumber> {
        return this.blockchainTransport.getBalance(address, minConf, transportConnectionId);
    }

    public async estimateFee(tx: Transaction, transportConnectionId: string): Promise<BigNumber> {
        return this.blockchainTransport.estimateFee(tx, transportConnectionId);
    }
}
