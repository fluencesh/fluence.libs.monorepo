import { MultivestError } from '@fluencesh/multivest.core';
import * as config from 'config';
import { NextFunction, Response } from 'express';
import { get } from 'lodash';
import { Errors } from '../errors';
import { AwsRequest } from '../types';
import { AuthMiddleware } from './auth.middleware';

export class AwsAuthMiddleware extends AuthMiddleware {
    public async attachProjectAndClient(req: AwsRequest, res: Response, next: NextFunction) {
        const pathToAuthLambdaContext = config.has('multivest.middleware.awsAuth.pathToAuthLambdaContext')
            ? config.get<string>('multivest.middleware.awsAuth.pathToAuthLambdaContext')
            : 'apiGateway.event.requestContext.authorizer';

        const authLambdaContext = get(req, pathToAuthLambdaContext, {});

        req.relatedClient = authLambdaContext.client || null;
        req.project = authLambdaContext.project || null;

        next();
    }
}
