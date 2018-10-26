import { WebMultivestError } from '@fluencesh/multivest.web';
import { NextFunction, Response } from 'express';
import { Errors } from '../errors';
import { AuthenticatedRequest } from '../types';

export class ProjectRequiredMiddleware {
    public verify(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        if (req.project === null) {
            return next(new WebMultivestError(Errors.PROJECT_REQUIRED, 403));
        }

        next();
    }
}
