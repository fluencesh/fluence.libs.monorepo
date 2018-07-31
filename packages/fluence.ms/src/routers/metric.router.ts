import { PluginManager } from '@fluencesh/multivest.core';
import { NextFunction, Request, Response, Router } from 'express';
import { Get, Response as SwResponse } from 'swapi/dist';
import { MetricRouterUrls } from '../constants';
import { MetricController } from '../controllers/metric.controller';
import { MetricServiceAuthMiddleware } from '../middlewares/metric.service.auth.middleware';
import { MetricValidation } from '../validation/metric';

export class MetricRouter {
    private controller: MetricController;
    private validationService: any;
    private authMiddleware: MetricServiceAuthMiddleware;

    constructor(
        pluginManager: PluginManager,
        metricAccessToken: string,
    ) {
        this.controller = new MetricController();

        this.authMiddleware = new MetricServiceAuthMiddleware(metricAccessToken);
        this.validationService = pluginManager.getService('validation.default.service');

        this.validationService.setValidation('Metric.GetMetric', MetricValidation.GetMetric);
    }

    public getRouter(): Router {
        const router = Router();

        router.get(
            MetricRouterUrls.GetMetrics,
            this.validationService.requestValidation('Metric.GetMetric'),
            (req: Request, res: Response, next: NextFunction) =>
                this.authMiddleware.isRequesterMetricService(req, res, next),
            (req: Request, res: Response, next: NextFunction) => this.getReport(req, res, next)
        );

        return router;
    }

    @Get(MetricRouterUrls.GetMetrics)
    @SwResponse(200, 'string')
    private getReport(req: Request, res: Response, next: NextFunction) {
        this.controller.getReport(req, res, next);
    }
}
