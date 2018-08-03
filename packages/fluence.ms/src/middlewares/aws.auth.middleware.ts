import { MultivestError } from '@applicature-private/multivest.core';
import { NextFunction, Response } from 'express';
import { get } from 'lodash';
import { Errors } from '../errors';
import { AwsRequest } from '../types';
import { AuthMiddleware } from './auth.middleware';

export class AwsAuthMiddleware extends AuthMiddleware {
    public async attachProjectAndClient(req: AwsRequest, res: Response, next: NextFunction) {
        req.relatedClient = get(req, 'apiGateway.context.client', null);
        req.project = get(req, 'apiGateway.context.project', null);

        if (!req.relatedClient) {
            return next(new MultivestError(Errors.FORBIDDEN, 403));
        }

        next();
    }
}
