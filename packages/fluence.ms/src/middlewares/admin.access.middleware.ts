import { MultivestError } from '@fluencesh/multivest.core';
import { NextFunction, Response } from 'express';
import { Errors } from '../errors';
import { ProjectRequest } from '../types';

export class AdminAccessMiddleware {
    public adminCheck(req: ProjectRequest, res: Response, next: NextFunction) {
        if (!req.relatedClient.isAdmin) {
            return next(new MultivestError(Errors.FORBIDDEN, 403));
        }

        next();
    }
}
