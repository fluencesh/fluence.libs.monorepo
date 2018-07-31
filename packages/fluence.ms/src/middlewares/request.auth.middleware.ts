import { MultivestError } from '@fluencesh/multivest.core';
import axios, { AxiosInstance } from 'axios';
import * as config from 'config';
import { NextFunction, Response } from 'express';
import { resolve } from 'url';
import { format } from 'util';
import { Errors } from '../errors';
import { ProjectRequest } from '../types';
import { AuthMiddleware } from './auth.middleware';

export class RequestAuthMiddleware extends AuthMiddleware {
    private projectPath: string;
    private clientPath: string;
    private idTag: string;
    private axios: AxiosInstance;

    /**
     * @param authMsUrl example: `'http://localhost:3000/'`
     * @param authMsProjectPath example: `'/projects/:id/'`
     * @param authMsClientPath example: `'/clients/:id/'`
     * @param idTag example: `':id'`
     */
    public constructor(
        authMsUrl: string,
        authMsProjectPath: string,
        authMsClientPath: string,
        idTag: string = ':id'
    ) {
        super();

        this.projectPath = authMsProjectPath;
        this.clientPath = authMsClientPath;
        this.idTag = idTag;

        this.axios = axios.create({
            baseURL: authMsUrl,
            timeout: 10000,
        });
    }

    public async attachProjectAndClient(req: ProjectRequest, res: Response, next: NextFunction) {
        try {
            const projectPath = this.projectPath.replace(this.idTag, req.query.projectId);
            const projectResponse = await this.axios.get(projectPath);
            req.project = projectResponse.data;

            const clientPath = this.clientPath.replace(this.idTag, req.project.clientId);
            const clientResponse = await this.axios.get(clientPath);
            req.relatedClient = clientResponse.data;
        } catch (ex) {
            return next(new MultivestError(Errors.AUTHENTICATION_FAILED, 502));
        }

        next();
    }
}
