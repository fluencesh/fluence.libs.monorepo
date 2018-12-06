import { NextFunction, Response } from 'express';
import Axios, { AxiosInstance } from 'axios';
import * as logger from 'winston';
import * as config from 'config';
import { WebMultivestError } from '@applicature/synth.web';
import { AuthMiddleware } from './auth.middleware';
import { AuthenticatedRequest, AuthPolicy, AuthPolicyEffect } from '../types';

export class HttpAuthMiddleware extends AuthMiddleware {
    private authServerRequester: AxiosInstance;

    constructor(authServerUrl: string) {
        super();
        this.authServerRequester = Axios.create({
            baseURL: authServerUrl
        });
    }

    public async attachProjectAndClient(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const requestBody = {
                path: req.path,
                method: req.method.toLocaleUpperCase(),
                clientId: req.query.clientId,
                projectId: req.query.projectId,
            };

            logger.info('Request data: ' + JSON.stringify(requestBody) + '. Auth header: ' + req.get('Authorization'));
            const response = await this.authServerRequester.post('/policy/', requestBody, {
                headers: {
                    Authorization: req.get('Authorization')
                }
            });

            const policy: AuthPolicy = response.data;

            if (policy.policyDocument.Statement[0].Effect === AuthPolicyEffect.Deny) {
                return next(new WebMultivestError('FORBIDDEN', 403));
            }

            const authData = JSON.parse(policy.context.stringKey);

            if (authData.requestClient) {
                req.relatedClient = authData.requestClient;
            }
            if (authData.requestProject) {
                req.project = authData.requestProject;
            }
            if (authData.session) {
                req.session = authData.session;
            }
            if (req.session && authData.sessionClient) {
                req.session.client = authData.sessionClient;
            }
            if (req.session && authData.sessionProject) {
                req.session.project = authData.sessionProject;
            }
    
            next();
        } catch (ex) {
            logger.error(`Authentication was failed. Reason: ${ ex.message }`);
            return next(ex);
        }
    }
}
