import { PluginManager } from '@applicature/core.plugin-manager';
import { NextFunction, Request, Response, Router } from 'express';
import { BaseUrl, Get, Response as SwResponse } from 'swapi/dist';
import { SwaggerRouterUrls } from '../constants';
import { SwaggerController } from '../controllers/swagger.controller';
import { AuthMiddleware } from '../middlewares';
import { SwaggerValidation } from '../validation';

@BaseUrl('/swagger/')
export class SwaggerRouter {
    private controller: SwaggerController;
    private validationService: any;
    private authMiddleware: AuthMiddleware;

    constructor(
        pluginManager: PluginManager,
        authMiddleware: AuthMiddleware
    ) {
        this.controller = new SwaggerController(pluginManager);
        this.authMiddleware = authMiddleware;

        this.validationService = pluginManager.getService('validation.service');
        this.validationService.setValidation('Swagger.GetSwaggerFile', SwaggerValidation.GetSwaggerFile);
    }

    public getRouter(): Router {
        const router = Router();

        router.get(
            SwaggerRouterUrls.GetSwaggerFile,
            this.validationService.requestValidation('Swagger.GetSwaggerFile'),
            (req: Request, res, next) => this.getSwaggerFile(req, res, next)
        );

        return router;
    }

    @Get(SwaggerRouterUrls.GetSwaggerFile)
    @SwResponse(200, 'string')
    private getSwaggerFile(req: Request, res: Response, next: NextFunction) {
        this.controller.getSwaggerFile(req, res, next);
    }
}
