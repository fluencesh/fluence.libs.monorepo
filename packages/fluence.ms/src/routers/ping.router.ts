import { NextFunction, Request, Response, Router } from 'express';
import { Get, Response as SwResponse } from 'swapi/dist';
import { PingRouterUrls } from '../constants';
import { PingController } from '../controllers/ping.controller';

export class PingRouter {
    private controller: PingController;

    constructor() {
        this.controller = new PingController();
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
