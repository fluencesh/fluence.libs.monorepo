import { NextFunction, Request, Response } from 'express';
import { HttpRequestMetricService } from '../services';

export class TimeoutMiddleware {
    private timeout: number;
    private metricService: HttpRequestMetricService;

    public constructor(timeout: number, metricService: HttpRequestMetricService) {
        this.timeout = timeout;
        this.metricService = metricService;
    }

    public setTimeout(req: Request, res: Response, next: NextFunction) {
        req.setTimeout(this.timeout, async () => {
            if (this.metricService) {
                const today = new Date();

                await Promise.all([
                    this.metricService.httpRequestsTimeout(1, today),
                    this.metricService.httpRequestsUnsuccessfullyExecuted(1, today),
                ]);
            }

            res.status(408).end();
        });

        next();
    }
}
