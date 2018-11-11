import { AuthenticatedRequest, AuthMiddleware } from '@applicature-private/fluence.ms.abstract';
import { PluginManager } from '@applicature-private/core.plugin-manager';
import {
    BlockchainService,
    Scheme,
    BlockchainTransportProvider,
    ManagedBlockchainTransportService
} from '@applicature-private/fluence.lib.services';
import * as express from 'express';
import { AbstractRouter, Body, Get, Post, Query, Response } from 'swapi/dist';
import { AbstractBlockchainRouteUrls } from '../constants';
import { AbstractBlockchainController } from '../controllers/abstract.blockchain.controller';
import { Errors } from '../errors';
import { AddressValidation, BlockValidation, TransactionValidation } from '../validation';

@AbstractRouter
export class AbstractBlockchainRouter<
    Transaction extends Scheme.BlockchainTransaction,
    Block extends Scheme.BlockchainBlock<Transaction>,
    Provider extends BlockchainTransportProvider<Transaction, Block>,
    ManagedService extends ManagedBlockchainTransportService<Transaction, Block, Provider>,
    BlockchainServiceType extends BlockchainService<Transaction, Block, Provider, ManagedService>
> {
    protected validationService: any;
    protected blockchainController: AbstractBlockchainController<
        Transaction,
        Block,
        Provider,
        ManagedService,
        BlockchainServiceType
    >;
    protected authMiddleware: AuthMiddleware;
    protected blockchainUrlPrefix: string;

    constructor(
        pluginManager: PluginManager,
        blockchainController: AbstractBlockchainController<
            Transaction,
            Block,
            Provider,
            ManagedService,
            BlockchainServiceType
        >,
        authMiddleware: AuthMiddleware,
        blockchainUrlPrefix: string = ''
    ) {
        this.blockchainController = blockchainController;
        this.authMiddleware = authMiddleware;
        this.blockchainUrlPrefix = blockchainUrlPrefix.replace(/\/$/, '');

        this.validationService = pluginManager.getService('validation.service');

        this.validationService.setValidation('Block.Get', BlockValidation.Get);
        this.validationService.setValidation('Transaction.GetByHash', TransactionValidation.GetByHash);
        this.validationService.setValidation('Transaction.Send', TransactionValidation.Send);
        this.validationService.setValidation('Address.GetAddressBalance', AddressValidation.GetAddressBalance);
    }

    public getRouter(): express.Router {
        const router = express.Router();

        router.get(
            this.blockchainUrlPrefix + AbstractBlockchainRouteUrls.GetBlocks,
            this.validationService.requestValidation('Block.Get'),
            (req: AuthenticatedRequest, res, next) => this.authMiddleware.attachProjectAndClient(req, res, next),
            (req: AuthenticatedRequest, res, next) => this.getBlockByHashOrNumber(req, res, next)
        );

        router.get(
            this.blockchainUrlPrefix + AbstractBlockchainRouteUrls.GetTransactionByHash,
            this.validationService.requestValidation('Transaction.GetByHash'),
            (req: AuthenticatedRequest, res, next) => this.authMiddleware.attachProjectAndClient(req, res, next),
            (req: AuthenticatedRequest, res, next) => this.getTransactionByHash(req, res, next)
        );

        // TODO: test
        router.post(
            this.blockchainUrlPrefix + AbstractBlockchainRouteUrls.SendTransaction,
            this.validationService.requestValidation('Transaction.Send'),
            (req: AuthenticatedRequest, res, next) => this.authMiddleware.attachProjectAndClient(req, res, next),
            (req: AuthenticatedRequest, res, next) => this.submitRawTransaction(req, res, next)
        );

        router.get(
            this.blockchainUrlPrefix + AbstractBlockchainRouteUrls.GetBalanceOfAddress,
            this.validationService.requestValidation('Address.GetAddressBalance'),
            (req: AuthenticatedRequest, res, next) => this.authMiddleware.attachProjectAndClient(req, res, next),
            (req: AuthenticatedRequest, res, next) => this.getAddressBalance(req, res, next)
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
    protected getBlockByHashOrNumber(req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) {
        this.blockchainController.getBlockByHashOrNumber(req, res, next);
    }

    @Get(AbstractBlockchainRouteUrls.GetTransactionByHash, 'Returns tx by hash')
    @Query({
        projectId: 'string*',
        token: 'string*',
    })
    @Response(404, 'string', false, Errors.TRANSACTION_NOT_FOUND)
    protected getTransactionByHash(req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) {
        this.blockchainController.getTransactionByHash(req, res, next);
    }

    @Post(AbstractBlockchainRouteUrls.SendTransaction, 'Sends tx')
    @Query({
        projectId: 'string*',
        token: 'string*',
    })
    @Body('hex', 'string*')
    @Response(404, 'string', false, Errors.TRANSACTION_NOT_FOUND)
    protected submitRawTransaction(req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) {
        this.blockchainController.submitRawTransaction(req, res, next);
    }

    @Get(AbstractBlockchainRouteUrls.GetBalanceOfAddress, 'Returns balance of address')
    @Query({
        projectId: 'string*',
        token: 'string*',
    })
    @Response(400, 'string', false, Errors.ADDRESS_IS_INVALID)
    @Response(404, 'string', false, Errors.ADDRESS_NOT_FOUND)
    protected getAddressBalance(req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) {
        this.blockchainController.getAddressBalance(req, res, next);
    }

    @Post(AbstractBlockchainRouteUrls.CallTroughJsonRpc, 'Calls blockchain API through json-rpc')
    @Body({
        id: 'number',
        jsonrpc: 'string*',
        method: 'string*',
        params: 'object',
    })
    @Response(200, 'object')
    protected callTroughJsonRpc(req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) {
        this.blockchainController.getAddressBalance(req, res, next);
    }
}
