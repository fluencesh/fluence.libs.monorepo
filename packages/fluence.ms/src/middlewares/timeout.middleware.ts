import { MetricService } from '@fluencesh/fluence.metric.services';
import { NextFunction, Request, Response } from 'express';

export class TimeoutMiddleware {
    private timeout: number;
    private metricService: MetricService;

    public constructor(timeout: number, metricService: MetricService) {
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
