import { PrometheusMetric } from '@fluencesh/multivest.services.blockchain';
import { NextFunction, Request, Response } from 'express';

export class MetricController {
    public getReport(req: Request, res: Response, next: NextFunction) {
        const report = PrometheusMetric.getInstance().getReport();

        PrometheusMetric.getInstance().clearAllMetrics();

        res
            .status(200)
            .set('Content-Type', 'text/plain')
            .send(report);
    }
}
