import { NextFunction, Request, Response } from 'express';
import { ApiMetrics } from '../metrics/api.metric';

export class MetricMiddleware {
    public collectMetric(req: Request, res: Response, next: NextFunction): void {
        const metric = ApiMetrics.getInstance();

        metric.incomingRequest();

        const responseEndFun = res.end;
        // tslint:disable-next-line:only-arrow-functions
        res.end = function() {
            const status = res.statusCode;
            if (status === 408) {
                metric.timeoutRequest();
            } else if (status >= 400) {
                metric.failedRequest();
            } else if (status >= 200 && status < 300) {
                metric.successRequest();
            }

            responseEndFun.apply(res, arguments);
        };

        next();
    }
}
