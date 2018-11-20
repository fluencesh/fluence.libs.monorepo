import { PluginManager } from '@applicature/synth.plugin-manager';
import { NextFunction, Request, Response, Router } from 'express';
import { BaseUrl, Get, Response as SwResponse } from 'swapi';
import { PingRouterUrls } from '../constants';
import { PingController } from '../controllers/ping.controller';

@BaseUrl('/ping/')
export class PingRouter {
    private controller: PingController;

    constructor(pluginManager: PluginManager) {
        this.controller = new PingController(pluginManager);
    }

    public getRouter(): Router {
        const router = Router();

        router.get(PingRouterUrls.Ping, (req, res, next) => this.ping(req, res, next));

        return router;
    }

    @Get(PingRouterUrls.Ping)
    @SwResponse(200, 'string')
    private ping(req: Request, res: Response, next: NextFunction) {
        this.controller.ping(req, res, next);
    }
}
