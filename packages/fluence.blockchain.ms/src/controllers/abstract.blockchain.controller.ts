import { Controller, ProjectRequest } from '@applicature-private/fluence.ms';
import { Block, PluginManager, Transaction } from '@applicature-private/multivest.core';
import {
    BlockchainService,
    ClientService,
    ProjectBlockchainSetupService,
    ProjectService,
    Scheme,
} from '@applicature-private/multivest.services.blockchain';
import { WebMultivestError } from '@applicature-private/multivest.web';
import BigNumber from 'bignumber.js';
import { NextFunction, Response } from 'express';
import { get, isNaN } from 'lodash';
import * as logger from 'winston';
import { Errors } from '../errors';
import { BlockchainMetricService } from '../services';

export abstract class AbstractBlockchainController extends Controller {
    protected blockchainService: BlockchainService;
    protected projectService: ProjectService;
    protected clientService: ClientService;
    protected projectBlockchainSetupService: ProjectBlockchainSetupService;
    protected metricService: BlockchainMetricService;

    constructor(
        pluginManager: PluginManager,
        blockchainService: BlockchainService,
        metricService?: BlockchainMetricService,
    ) {
        super(pluginManager);

        this.blockchainService = blockchainService;
        this.metricService = metricService;
        this.projectService = pluginManager.getServiceByClass(ProjectService) as ProjectService;
        this.clientService = pluginManager.getServiceByClass(ClientService) as ClientService;
        this.projectBlockchainSetupService =
            pluginManager.getServiceByClass(ProjectBlockchainSetupService) as ProjectBlockchainSetupService;
    }

    public abstract convertBlockDTO(block: Block): any;
    public abstract convertTransactionDTO(transaction: Transaction): any;
    public abstract convertAddressBalanceDTO(address: string, balance: BigNumber): any;

    public convertScheduledTxDTO(scheduledTx: Scheme.ScheduledTx) {
        return {
            cronExpression: scheduledTx.cronExpression,
            id: scheduledTx.id,
            projectId: scheduledTx.projectId,
            tx: this.convertTransactionDTO(scheduledTx.tx)
        };
    }

    public async getBlockByHashOrNumber(req: ProjectRequest, res: Response, next: NextFunction): Promise<void> {
        let block;

        let transportConnectionId: string;
        try {
            transportConnectionId = await this.extractTransportConnectionId(req);
        } catch (ex) {
            this.handleError(ex, next);
        }

        if (req.query.number) {
            const height = Number(req.query.number);
            
            if (!isNaN(height)) {
                try {
                    block = await this.blockchainService.getBlockByHeight(height, transportConnectionId);
                } catch (ex) {
                    return this.handleError(ex, next);
                }
            } else {
                return next(new WebMultivestError(Errors.INVALID_BLOCK_NUMBER, 400));
            }
        } else if (req.query.hash) {
            try {
                block = await this.blockchainService.getBlockByHash(req.query.hash, transportConnectionId);
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

    public async getTransactionByHash(req: ProjectRequest, res: Response, next: NextFunction): Promise<void> {
        const hash = req.params.hash;

        let transportConnectionId: string;
        try {
            transportConnectionId = await this.extractTransportConnectionId(req);
        } catch (ex) {
            this.handleError(ex, next);
        }

        let transaction: Transaction;
        try {
            transaction = await this.blockchainService.getTransactionByHash(hash, transportConnectionId);
        } catch (ex) {
            return this.handleError(ex, next);
        }

        if (!transaction) {
            return next(new WebMultivestError(Errors.TRANSACTION_NOT_FOUND, 404));
        }

        const dto = this.convertTransactionDTO(transaction);

        res.status(200).send(dto);
    }

    public async submitRawTransaction(req: ProjectRequest, res: Response, next: NextFunction): Promise<void> {
        const hex = req.body.hex;

        let transportConnectionId: string;
        try {
            transportConnectionId = await this.extractTransportConnectionId(req);
        } catch (ex) {
            this.handleError(ex, next);
        }

        const today = new Date();

        let transaction: Transaction;
        try {
            transaction = await this.blockchainService.sendRawTransaction(hex, req.project.id, transportConnectionId);
        } catch (ex) {
            if (this.metricService) {
                try {
                    await this.metricService.transactionsUnsuccessfullySent(
                        this.blockchainService.getBlockchainId(),
                        this.blockchainService.getNetworkId(),
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
                    this.blockchainService.getBlockchainId(),
                    this.blockchainService.getNetworkId(),
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

    public async getAddressBalance(req: ProjectRequest, res: Response, next: NextFunction): Promise<void> {
        const address = req.params.address;
        const minConf = req.query.minConf;

        if (!this.blockchainService.isValidAddress(address)) {
            return next(new WebMultivestError(Errors.ADDRESS_IS_INVALID, 400));
        }

        let transportConnectionId: string;
        try {
            transportConnectionId = await this.extractTransportConnectionId(req);
        } catch (ex) {
            this.handleError(ex, next);
        }

        let balance: BigNumber;
        try {
            balance = await this.blockchainService.getBalance(address, minConf, transportConnectionId);
        } catch (ex) {
            return this.handleError(ex, next);
        }

        if (!balance) {
            return next(new WebMultivestError(Errors.ADDRESS_NOT_FOUND, 404));
        }

        const dto = this.convertAddressBalanceDTO(address, balance);

        res.status(200).send(dto);
    }

    public abstract callTroughJsonRpc(req: ProjectRequest, res: Response, next: NextFunction): Promise<void>;

    protected async extractTransportConnectionId(req: ProjectRequest): Promise<string | undefined> {
        const projectId: string = get(req, 'project.id', null);

        if (!projectId) {
            return;
        }

        const transportConnectionId: string = req.query.transportConnectionId;
        if (transportConnectionId) {
            const valid = await this.isTransportConnectionIdValid(transportConnectionId, projectId);
            if (!valid) {
                throw new WebMultivestError(Errors.UNKNOWN_TRANSPORT_CONNECTION, 404);
            }

            return transportConnectionId;
        }

        return;
    }

    protected async isTransportConnectionIdValid(
        transportConnectionId: string,
        projectId: string
    ) {
        const privateProjectSetup = await this.projectBlockchainSetupService
            .getByTransportConnectionIdAndProjectId(transportConnectionId, projectId);

        return privateProjectSetup !== null;
    }
}
