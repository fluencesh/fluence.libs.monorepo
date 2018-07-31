import { PluginManager } from '@applicature-private/multivest.core';
import * as express from 'express';
import { AbstractRouter, Body, Get, Patch, Post, Put, Query, Response } from 'swapi/dist';
import { AbstractBlockchainRouteUrls } from '../constants';
import { AbstractBlockchainController } from '../controllers/abstract.blockchain.controller';
import { Errors } from '../errors';
import { AuthMiddleware } from '../middlewares';
import { ProjectRequest } from '../types';
import { AddressValidation } from '../validation/address';
import { BlockValidation } from '../validation/block';
import { TransactionValidation } from '../validation/transaction';

@AbstractRouter
export class AbstractBlockchainRouter {
    protected validationService: any;
    protected blockchainController: AbstractBlockchainController;
    protected authMiddleware: AuthMiddleware;

    constructor(
        pluginManager: PluginManager,
        blockchainController: AbstractBlockchainController,
        authMiddleware: AuthMiddleware
    ) {
        this.blockchainController = blockchainController;

        this.validationService = pluginManager.getService('validation.default.service');

        this.authMiddleware = authMiddleware;

        this.validationService.setValidation('Block.Get', BlockValidation.Get);
        this.validationService.setValidation('Transaction.GetByHash', TransactionValidation.GetByHash);
        this.validationService.setValidation('Transaction.Send', TransactionValidation.Send);
        this.validationService.setValidation('Address.GetAddressBalance', AddressValidation.GetAddressBalance);
    }

    public getRouter(): express.Router {
        const router = express.Router();

        router.get(
            AbstractBlockchainRouteUrls.GetBlocks,
            this.validationService.requestValidation('Block.Get'),
            (req: ProjectRequest, res, next) => this.authMiddleware.attachProjectAndClient(req, res, next),
            (req: ProjectRequest, res, next) => this.getBlockByHashOrNumber(req, res, next)
        );

        router.get(
            AbstractBlockchainRouteUrls.GetTransactionByHash,
            this.validationService.requestValidation('Transaction.GetByHash'),
            (req: ProjectRequest, res, next) => this.authMiddleware.attachProjectAndClient(req, res, next),
            (req: ProjectRequest, res, next) => this.getTransactionByHash(req, res, next)
        );

        // TODO: test
        router.post(
            AbstractBlockchainRouteUrls.SendTransaction,
            this.validationService.requestValidation('Transaction.Send'),
            (req: ProjectRequest, res, next) => this.authMiddleware.attachProjectAndClient(req, res, next),
            (req: ProjectRequest, res, next) => this.submitRawTransaction(req, res, next)
        );

        router.get(
            AbstractBlockchainRouteUrls.GetBalanceOfAddress,
            this.validationService.requestValidation('Address.GetAddressBalance'),
            (req: ProjectRequest, res, next) => this.authMiddleware.attachProjectAndClient(req, res, next),
            (req: ProjectRequest, res, next) => this.getAddressBalance(req, res, next)
        );

        return router;
    }

    @Get(AbstractBlockchainRouteUrls.GetBlocks, 'Returns block by hash or number')
    @Query({
        hash: 'string',
        number: 'string',
        projectId: 'string*',
        token: 'string*',
    })
    @Response(404, 'string', false, Errors.BLOCK_NOT_FOUND)
    @Response(400, 'string', false, Errors.INVALID_BLOCK_NUMBER)
    protected getBlockByHashOrNumber(req: ProjectRequest, res: express.Response, next: express.NextFunction) {
        this.blockchainController.getBlockByHashOrNumber(req, res, next);
    }

    @Get(AbstractBlockchainRouteUrls.GetTransactionByHash, 'Returns tx by hash')
    @Query({
        projectId: 'string*',
        token: 'string*',
    })
    @Response(404, 'string', false, Errors.TRANSACTION_NOT_FOUND)
    protected getTransactionByHash(req: ProjectRequest, res: express.Response, next: express.NextFunction) {
        this.blockchainController.getTransactionByHash(req, res, next);
    }

    @Post(AbstractBlockchainRouteUrls.SendTransaction, 'Sends tx')
    @Query({
        projectId: 'string*',
        token: 'string*',
    })
    @Body('hex', 'string*')
    @Response(404, 'string', false, Errors.TRANSACTION_NOT_FOUND)
    protected submitRawTransaction(req: ProjectRequest, res: express.Response, next: express.NextFunction) {
        this.blockchainController.submitRawTransaction(req, res, next);
    }

    @Get(AbstractBlockchainRouteUrls.GetBalanceOfAddress, 'Returns balance of address')
    @Query({
        projectId: 'string*',
        token: 'string*',
    })
    @Response(400, 'string', false, Errors.ADDRESS_IS_INVALID)
    @Response(404, 'string', false, Errors.ADDRESS_NOT_FOUND)
    protected getAddressBalance(req: ProjectRequest, res: express.Response, next: express.NextFunction) {
        this.blockchainController.getAddressBalance(req, res, next);
    }
}
