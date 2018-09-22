import { MetricService } from '@applicature-private/fluence.metric.services';
import { NextFunction, Request, Response } from 'express';
import * as logger from 'winston';

export class RequestMetrics {
    private metricService: MetricService;

    constructor(metricService: MetricService) {
        this.metricService = metricService;
    }

    public async processRequest(req: Request, res: Response, next: NextFunction) {
        const today = new Date();
        const metricService = this.metricService;

        await metricService.incomingHttpRequests(1, today);

        const originalEnd = res.end;
        res.end = function(...arg: Array<any>) {
            const saveMetricPromise: Promise<void> = this.statusCode >= 400
                ? metricService.httpRequestsUnsuccessfullyExecuted(1, today)
                : metricService.httpRequestsSuccessfullyExecuted(1, today);

            saveMetricPromise.catch((ex) => logger.error(`Cant save metric. Reason: ${ ex.message }`));

            originalEnd.apply(res, arg);
        };

        next();
    }
}
