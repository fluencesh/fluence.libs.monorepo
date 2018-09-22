import { WebMultivestError } from '@applicature-private/multivest.web';
import { NextFunction, Response } from 'express';
import { Errors } from '../errors';
import { ProjectRequest } from '../types';

export class AnonymousForbiddenMiddleware {
    public verify(req: ProjectRequest, res: Response, next: NextFunction) {
        if (req.relatedClient === null || req.session === null) {
            return next(new WebMultivestError(Errors.AUTHORIZATION_REQUIRED, 401));
        }

        next();
    }
}
