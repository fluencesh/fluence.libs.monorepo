import { MultivestError } from '@fluencesh/multivest.core';
import { NextFunction, Request, Response } from 'express';
import { Errors } from '../errors';
import { secureStringComparer } from '../utils';

export class MetricServiceAuthMiddleware {
    private validToken: string;

    constructor(validToken: string) {
        this.validToken = validToken;
    }

    public isRequesterMetricService(req: Request, res: Response, next: NextFunction) {
        const token: string = req.query.token;

        if (secureStringComparer(this.validToken, token)) {
            next();
        } else {
            next(new MultivestError(Errors.FORBIDDEN, 403));
        }
    }
}
