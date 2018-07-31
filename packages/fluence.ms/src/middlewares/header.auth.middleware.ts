import { MultivestError } from '@fluencesh/multivest.core';
import { NextFunction, Response } from 'express';
import { Errors } from '../errors';
import { ProjectRequest } from '../types';
import { AuthMiddleware } from './auth.middleware';

export class HeaderAuthMiddleware extends AuthMiddleware {
    private projectHeader: string;
    private clientHeader: string;

    constructor(
        projectHeader: string,
        clientHeader: string
    ) {
        super();

        this.projectHeader = projectHeader;
        this.clientHeader = clientHeader;
    }

    public async attachProjectAndClient(req: ProjectRequest, res: Response, next: NextFunction) {
        const projectRaw = req.header(this.projectHeader);
        const clientRaw = req.header(this.clientHeader);

        try {
            req.project = JSON.parse(projectRaw);
            req.relatedClient = JSON.parse(clientRaw);
        } catch (ex) {
            return next(new MultivestError(Errors.FORBIDDEN));
        }
        next();
    }
}
