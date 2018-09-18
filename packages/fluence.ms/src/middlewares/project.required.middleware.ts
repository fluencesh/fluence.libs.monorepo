import { MultivestError } from '@applicature-private/multivest.core';
import { NextFunction, Response } from 'express';
import { Errors } from '../errors';
import { ProjectRequest } from '../types';

export class ProjectRequiredMiddleware {
    public verify(req: ProjectRequest, res: Response, next: NextFunction) {
        if (req.project === null) {
            return next(new MultivestError(Errors.PROJECT_REQUIRED, 403));
        }

        next();
    }
}
