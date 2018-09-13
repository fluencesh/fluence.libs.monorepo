import { MultivestError } from '@applicature-private/multivest.core';
import { NextFunction, Response } from 'express';
import { Errors } from '../errors';
import { ProjectRequest } from '../types';

export class AnonymousForbiddenMiddleware {
    public verify(req: ProjectRequest, res: Response, next: NextFunction) {
        if (req.project === null || req.relatedClient === null || req.session === null) {
            return next(new MultivestError(Errors.AUTHORIZATION_REQUIRED, 401));
        }

        next();
    }
}
