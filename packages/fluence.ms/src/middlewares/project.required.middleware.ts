import { WebMultivestError } from '@applicature-private/multivest.web';
import { NextFunction, Response } from 'express';
import { Errors } from '../errors';
import { ProjectRequest } from '../types';

export class ProjectRequiredMiddleware {
    public verify(req: ProjectRequest, res: Response, next: NextFunction) {
        if (req.project === null) {
            return next(new WebMultivestError(Errors.PROJECT_REQUIRED, 403));
        }

        next();
    }
}
