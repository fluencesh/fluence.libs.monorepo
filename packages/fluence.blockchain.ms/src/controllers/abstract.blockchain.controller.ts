import { Controller, ProjectRequest } from '@applicature-private/fluence.ms';
import { Block, MultivestError, PluginManager, Transaction } from '@applicature-private/multivest.core';
import {
    BlockchainService,
    ClientService,
    ProjectService,
    Scheme
} from '@applicature-private/multivest.services.blockchain';
import BigNumber from 'bignumber.js';
import { NextFunction, Response } from 'express';
import { isNaN } from 'lodash';
import { Errors } from '../errors';

export abstract class AbstractBlockchainController extends Controller {
    protected blockchainService: BlockchainService;
    protected projectService: ProjectService;
    protected clientService: ClientService;

    constructor(pluginManager: PluginManager, blockchainService: BlockchainService) {
        super(pluginManager);

        this.blockchainService = blockchainService;
        this.projectService = pluginManager.getServiceByClass(ProjectService) as ProjectService;
        this.clientService = pluginManager.getServiceByClass(ClientService) as ClientService;
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

    public async getBlockByHashOrNumber(req: ProjectRequest, res: Response, next: NextFunction):
        Promise<void>
    {
        let block;

        if (req.query.number) {
            const height = Number(req.query.number);
            
            if (!isNaN(height)) {
                try {
                    block = await this.blockchainService.getBlockByHeight(height);
                } catch (ex) {
                    return this.handleError(ex, next);
                }
            } else {
                return next(new MultivestError(Errors.INVALID_BLOCK_NUMBER, 400));
            }
        } else if (req.query.hash) {
            try {
                block = await this.blockchainService.getBlockByHash(req.query.hash);
            } catch (ex) {
                return this.handleError(ex, next);
            }
        }

        if (!block) {
            return next(new MultivestError(Errors.BLOCK_NOT_FOUND, 404));
        }

        const dto = this.convertBlockDTO(block);

        res.status(200).send(dto);
    }

    public async getTransactionByHash(req: ProjectRequest, res: Response, next: NextFunction): Promise<void> {
        const hash = req.params.hash;

        let transaction: Transaction;
        try {
            transaction = await this.blockchainService.getTransactionByHash(hash);
        } catch (ex) {
            return this.handleError(ex, next);
        }

        if (!transaction) {
            return next(new MultivestError(Errors.TRANSACTION_NOT_FOUND, 404));
        }

        const dto = this.convertTransactionDTO(transaction);

        res.status(200).send(dto);
    }

    public async submitRawTransaction(req: ProjectRequest, res: Response, next: NextFunction): Promise<void> {
        const hex = req.body.hex;

        let transaction: Transaction;
        try {
            transaction = await this.blockchainService.sendRawTransaction(hex, req.project.id);
        } catch (ex) {
            return this.handleError(ex, next);
        }

        if (!transaction) {
            return next(new MultivestError(Errors.TRANSACTION_NOT_FOUND, 404));
        }

        const dto = this.convertTransactionDTO(transaction);

        res.status(200).send(dto);
    }

    public async getAddressBalance(req: ProjectRequest, res: Response, next: NextFunction): Promise<void> {
        const address = req.params.address;
        const minConf = req.params.minConf;

        if (!this.blockchainService.isValidAddress(address)) {
            return next(new MultivestError(Errors.ADDRESS_IS_INVALID, 400));
        }

        let balance: BigNumber;
        try {
            balance = await this.blockchainService.getBalance(address, minConf);
        } catch (ex) {
            return this.handleError(ex, next);
        }

        if (!balance) {
            return next(new MultivestError(Errors.ADDRESS_NOT_FOUND, 404));
        }

        const dto = this.convertAddressBalanceDTO(address, balance);

        res.status(200).send(dto);
    }

    public abstract callTroughJsonRpc(req: ProjectRequest, res: Response, next: NextFunction): Promise<void>;
}
