import { MultivestError } from '@applicature-private/multivest.core';
import * as config from 'config';
import { NextFunction, Response } from 'express';
import { get } from 'lodash';
import * as logger from 'winston';
import { Errors } from '../errors';
import { AwsRequest } from '../types';
import { AuthMiddleware } from './auth.middleware';

export class AwsAuthMiddleware extends AuthMiddleware {
    public async attachProjectAndClient(req: AwsRequest, res: Response, next: NextFunction) {
        const pathToAuthLambdaContext = config.has('multivest.middleware.awsAuth.pathToAuthLambdaContext')
            ? config.get<string>('multivest.middleware.awsAuth.pathToAuthLambdaContext')
            : 'apiGateway.event.requestContext.authorizer.stringKey';

        let authLambdaContext = get(req, pathToAuthLambdaContext, {});
        if (typeof authLambdaContext === 'string') {
            try {
                authLambdaContext = JSON.parse(authLambdaContext);
            } catch (ex) {
                logger.info(
                    `data in ${ pathToAuthLambdaContext } is not JSON. authorization data wont be available in request`
                );
            }
        }

        req.relatedClient = authLambdaContext.requestClient || null;
        req.project = authLambdaContext.requestProject || null;
        req.session = authLambdaContext.session || null;
        if (req.session) {
            req.session.client = authLambdaContext.sessionClient || null;
            req.session.project = authLambdaContext.sessionProject || null;
        }

        next();
    }
}
