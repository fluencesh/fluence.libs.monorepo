import { AuthenticatedRequest, Controller } from '@fluencesh/fluence.ms.abstract';
import { PluginManager } from '@applicature/synth.plugin-manager';
import {
    BlockchainRegistryService,
    BlockchainService,
    ClientService,
    Errors as BlockchainServicesErrors,
    ProjectBlockchainSetupService,
    ProjectService,
    Scheme,
    TransportConnectionService,
    BlockchainTransportProvider,
    ManagedBlockchainTransport,
} from '@fluencesh/fluence.lib.services';
import { WebMultivestError } from '@applicature/synth.web';
import BigNumber from 'bignumber.js';
import { NextFunction, Response } from 'express';
import { get, isNaN } from 'lodash';
import * as logger from 'winston';
import { Errors } from '../errors';
import { BlockchainMetricService } from '../services';

export abstract class AbstractBlockchainController<
    Transaction extends Scheme.BlockchainTransaction,
    Block extends Scheme.BlockchainBlock<Transaction>,
    Provider extends BlockchainTransportProvider<Transaction, Block>,
    ManagedService extends ManagedBlockchainTransport<Transaction, Block, Provider>,
    BlockchainServiceType extends BlockchainService<Transaction, Block, Provider, ManagedService>
> extends Controller {
    protected blockchainRegistry: BlockchainRegistryService;
    protected projectService: ProjectService;
    protected clientService: ClientService;
    protected projectBlockchainSetupService: ProjectBlockchainSetupService;
    protected transportConnectionService: TransportConnectionService;
    protected metricService: BlockchainMetricService;
    protected blockchainId: string;

    constructor(
        pluginManager: PluginManager,
        blockchainRegistry: BlockchainRegistryService,
        blockchainId: string,
        metricService?: BlockchainMetricService
    ) {
        super(pluginManager);

        this.blockchainRegistry = blockchainRegistry;
        this.blockchainId = blockchainId;

        this.metricService = metricService;
        this.projectService = pluginManager.getServiceByClass(ProjectService);
        this.clientService = pluginManager.getServiceByClass(ClientService);
        this.projectBlockchainSetupService = pluginManager.getServiceByClass(ProjectBlockchainSetupService);
        this.transportConnectionService = pluginManager.getServiceByClass(TransportConnectionService);
    }

    public abstract convertBlockDTO(block: Block): any;
    public abstract convertTransactionDTO(transaction: Transaction): any;
    public abstract convertAddressBalanceDTO(address: string, balance: BigNumber): any;

    public convertScheduledTxDTO(scheduledTx: Scheme.ScheduledTx) {
        return {
            cronExpression: scheduledTx.cronExpression,
            id: scheduledTx.id,
            projectId: scheduledTx.projectId,
            tx: this.convertTransactionDTO(scheduledTx.tx as Transaction)
        };
    }

    public async getBlockByHashOrNumber(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        let block: Block;

        let transportConnection: Scheme.TransportConnection;
        try {
            transportConnection = await this.extractTransportConnection(req);
        } catch (ex) {
            return this.handleError(ex, next);
        }

        let blockchainService;
        try {
            const networkId = transportConnection.networkId;
            blockchainService = this.getBlockchainService(networkId);
        } catch (ex) {
            return this.handleError(ex, next);
        }

        if (req.query.number) {
            const height = Number(req.query.number);
            
            if (!isNaN(height)) {
                try {
                    // FIXME: migrate to right types (should return Scheme.BlockchainBlock)
                    block = await blockchainService.getBlockByHeight(height, transportConnection.id);
                } catch (ex) {
                    return this.handleError(ex, next);
                }
            } else {
                return next(new WebMultivestError(Errors.INVALID_BLOCK_NUMBER, 400));
            }
        } else if (req.query.hash) {
            try {
                // FIXME: migrate to right types (should return Scheme.BlockchainBlock)
                block = await blockchainService.getBlockByHash(req.query.hash, transportConnection.id);
            } catch (ex) {
                return this.handleError(ex, next);
            }
        }

        if (!block) {
            return next(new WebMultivestError(Errors.BLOCK_NOT_FOUND, 404));
        }

        const dto = this.convertBlockDTO(block);

        res.status(200).send(dto);
    }

    public async getTransactionByHash(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        const hash = req.params.hash;

        let transportConnection: Scheme.TransportConnection;
        try {
            transportConnection = await this.extractTransportConnection(req);
        } catch (ex) {
            return this.handleError(ex, next);
        }

        let transaction: Transaction;
        try {
            const networkId = transportConnection.networkId;
            // FIXME: migrate to right types (should return Scheme.BlockchainTransaction)
            transaction = await this
                .getBlockchainService(networkId)
                .getTransactionByHash(hash, transportConnection.id);
        } catch (ex) {
            return this.handleError(ex, next);
        }

        if (!transaction) {
            return next(new WebMultivestError(Errors.TRANSACTION_NOT_FOUND, 404));
        }

        const dto = this.convertTransactionDTO(transaction);

        res.status(200).send(dto);
    }

    public async submitRawTransaction(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        const hex = req.body.hex;

        let transportConnection: Scheme.TransportConnection;
        try {
            transportConnection = await this.extractTransportConnection(req);
        } catch (ex) {
            return this.handleError(ex, next);
        }

        const today = new Date();

        let blockchainService;
        try {
            const networkId = transportConnection.networkId;
            blockchainService = this.getBlockchainService(networkId);
        } catch (ex) {
            return this.handleError(ex, next);
        }

        let transaction: Transaction;
        try {
            transaction = await blockchainService.sendRawTransaction(hex, req.project.id, transportConnection.id);
        } catch (ex) {
            if (this.metricService) {
                try {
                    await this.metricService.transactionsUnsuccessfullySent(
                        blockchainService.getBlockchainId(),
                        blockchainService.getNetworkId(),
                        transportConnection.id,
                        1,
                        today
                    );
                } catch (ex) {
                    logger.error(`Cant save metric. Reason: ${ ex.message }`);
                }
            }

            return this.handleError(ex, next);
        }

        if (this.metricService) {
            try {
                await this.metricService.transactionsSuccessfullySent(
                    blockchainService.getBlockchainId(),
                    blockchainService.getNetworkId(),
                    transportConnection.id,
                    1,
                    today
                );
            } catch (ex) {
                logger.error(`Cant save metric. Reason: ${ ex.message }`);
            }
        }

        if (!transaction) {
            return next(new WebMultivestError(Errors.TRANSACTION_NOT_FOUND, 404));
        }

        const dto = this.convertTransactionDTO(transaction);

        res.status(200).send(dto);
    }

    public async getAddressBalance(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        const address = req.params.address;
        const minConf = req.query.minConf;

        let transportConnection: Scheme.TransportConnection;
        try {
            transportConnection = await this.extractTransportConnection(req);
        } catch (ex) {
            return this.handleError(ex, next);
        }

        let blockchainService;
        try {
            const networkId = transportConnection.networkId;
            blockchainService = this.getBlockchainService(networkId);
        } catch (ex) {
            return this.handleError(ex, next);
        }

        if (!blockchainService.isValidAddress(address)) {
            return next(new WebMultivestError(Errors.ADDRESS_IS_INVALID, 400));
        }

        let balance: BigNumber;
        try {
            balance = await blockchainService.getBalance(address, minConf, transportConnection.id);
        } catch (ex) {
            return this.handleError(ex, next);
        }

        if (!balance) {
            return next(new WebMultivestError(Errors.ADDRESS_NOT_FOUND, 404));
        }

        const dto = this.convertAddressBalanceDTO(address, balance);

        res.status(200).send(dto);
    }

    public abstract callTroughJsonRpc(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;

    protected async extractTransportConnection(req: AuthenticatedRequest): Promise<Scheme.TransportConnection> {
        const projectId: string = get(req, 'project.id', null);

        const transportConnectionId: string = req.query.transportConnectionId;

        const valid = await this.isTransportConnectionIdValid(transportConnectionId, projectId);
        if (!valid) {
            throw new WebMultivestError(Errors.UNKNOWN_TRANSPORT_CONNECTION, 404);
        }

        const transportConnection = await this.transportConnectionService.getById(transportConnectionId);

        return transportConnection;
    }

    protected async isTransportConnectionIdValid(
        transportConnectionId: string,
        projectId: string
    ) {
        const privateProjectSetup = await this.projectBlockchainSetupService
            .getByTransportConnectionId(transportConnectionId);

        if (privateProjectSetup) {
            return privateProjectSetup.projectId === projectId;
        }

        return true;
    }

    protected getBlockchainService(networkId: string): BlockchainServiceType {
        try {
            const blockchainService =
                this.blockchainRegistry.getByBlockchainInfo<BlockchainServiceType>(this.blockchainId, networkId);

            return blockchainService;
        } catch (ex) {
            if (ex.message === BlockchainServicesErrors.BLOCKCHAIN_SERVICE_DOES_NOT_IN_REGISTRY) {
                throw new WebMultivestError(Errors.UNKNOWN_NETWORK, 400);
            }

            throw ex;
        }
    }
}
