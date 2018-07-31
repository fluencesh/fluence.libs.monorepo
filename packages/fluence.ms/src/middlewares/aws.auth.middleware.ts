import { NextFunction, Response } from 'express';
import { AwsRequest } from '../types';
import { AuthMiddleware } from './auth.middleware';

export class AwsAuthMiddleware extends AuthMiddleware {
    public async attachProjectAndClient(req: AwsRequest, res: Response, next: NextFunction) {
        req.relatedClient = req.apiGateway.context.client;
        req.project = req.apiGateway.context.project;

        next();
    }
}
