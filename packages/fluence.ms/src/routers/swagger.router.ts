import { PluginManager } from '@fluencesh/multivest.core';
import { NextFunction, Response, Router } from 'express';
import { BaseUrl, Get, Response as SwResponse } from 'swapi/dist';
import { SwaggerRouterUrls } from '../constants';
import { SwaggerController } from '../controllers/swagger.controller';
import { AuthMiddleware } from '../middlewares';
import { ProjectRequest } from '../types';
import { SwaggerValidation } from '../validation';

@BaseUrl('/swagger/')
export class SwaggerRouter {
    private controller: SwaggerController;
    private validationService: any;
    private authMiddleware: AuthMiddleware;

    constructor(
        pluginManager: PluginManager,
        authMiddleware: AuthMiddleware,
        pathToSwaggerFile: string
    ) {
        this.controller = new SwaggerController(pathToSwaggerFile);
        this.authMiddleware = authMiddleware;

        this.validationService = pluginManager.getService('validation.default.service');
        this.validationService.setValidation('Swagger.GetSwaggerFile', SwaggerValidation.GetSwaggerFile);
    }

    public getRouter(): Router {
        const router = Router();

        router.get(
            SwaggerRouterUrls.GetSwaggerFile,
            this.validationService.requestValidation('Swagger.GetSwaggerFile'),
            (req: ProjectRequest, res, next) => this.authMiddleware.attachProjectAndClient(req, res, next),
            (req: ProjectRequest, res, next) => this.getSwaggerFile(req, res, next)
        );

        return router;
    }

    @Get(SwaggerRouterUrls.GetSwaggerFile)
    @SwResponse(200, 'string')
    private getSwaggerFile(req: ProjectRequest, res: Response, next: NextFunction) {
        this.controller.getSwaggerFile(req, res, next);
    }
}
