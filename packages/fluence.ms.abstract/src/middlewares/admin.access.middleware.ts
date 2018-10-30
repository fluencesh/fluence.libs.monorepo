import { WebMultivestError } from '@applicature/core.web';
import { NextFunction, Response } from 'express';
import { Errors } from '../errors';
import { AuthenticatedRequest } from '../types';

export class AdminAccessMiddleware {
    public adminCheck(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        if (!req.relatedClient.isAdmin) {
            return next(new WebMultivestError(Errors.FORBIDDEN, 403));
        }

        next();
    }
}
