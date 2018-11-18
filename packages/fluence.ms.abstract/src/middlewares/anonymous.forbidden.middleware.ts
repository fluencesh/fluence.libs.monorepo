import { WebMultivestError } from '@applicature/synth.web';
import { NextFunction, Response } from 'express';
import { Errors } from '../errors';
import { AuthenticatedRequest } from '../types';

export class AnonymousForbiddenMiddleware {
    public verify(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        if (req.relatedClient === null || req.session === null) {
            return next(new WebMultivestError(Errors.AUTHORIZATION_REQUIRED, 401));
        }

        next();
    }
}
