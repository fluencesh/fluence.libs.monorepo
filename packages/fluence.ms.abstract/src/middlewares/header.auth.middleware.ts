import { Scheme } from '@fluencesh/fluence.lib.services';
import { WebMultivestError } from '@applicature/synth.web';
import { NextFunction, Response } from 'express';
import { Errors } from '../errors';
import { AuthenticatedRequest, ProjectSession } from '../types';
import { AuthMiddleware } from './auth.middleware';

export class HeaderAuthMiddleware extends AuthMiddleware {
    private projectHeader: string;
    private clientHeader: string;
    private sessionHeader: string;
    private sessionClientHeader: string;
    private sessionProjectHeader: string;

    constructor(
        projectHeader: string,
        clientHeader: string,
        sessionHeader: string,
        sessionClientHeader: string,
        sessionProjectHeader: string
    ) {
        super();

        this.projectHeader = projectHeader;
        this.clientHeader = clientHeader;
        this.sessionHeader = sessionHeader;
        this.sessionClientHeader = sessionClientHeader;
        this.sessionProjectHeader = sessionProjectHeader;
    }

    public async attachProjectAndClient(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const projectRaw = req.header(this.projectHeader);
        const clientRaw = req.header(this.clientHeader);
        const sessionRaw = req.header(this.sessionHeader);
        const sessionClientRaw = req.header(this.sessionClientHeader);
        const sessionProjectRaw = req.header(this.sessionProjectHeader);

        if (clientRaw) {
            try {
                req.relatedClient = JSON.parse(clientRaw);
            } catch (ex) {
                return next(new WebMultivestError(Errors.FORBIDDEN, 403));
            }
        } else {
            req.relatedClient = null;
        }

        if (projectRaw) {
            try {
                req.project = JSON.parse(projectRaw);
            } catch (ex) {
                return next(new WebMultivestError(Errors.FORBIDDEN, 403));
            }
        } else {
            req.project = null;
        }

        if (sessionRaw) {
            try {
                req.session = JSON.parse(sessionRaw);
            } catch (ex) {
                return next(new WebMultivestError(Errors.FORBIDDEN, 403));
            }
        } else {
            req.session = null;
        }

        if (req.session && sessionClientRaw) {
            try {
                req.session.client = JSON.parse(sessionClientRaw);
            } catch (ex) {
                return next(new WebMultivestError(Errors.FORBIDDEN, 403));
            }
        }

        if (req.session && sessionProjectRaw) {
            try {
                req.session.project = JSON.parse(sessionProjectRaw);
            } catch (ex) {
                return next(new WebMultivestError(Errors.FORBIDDEN, 403));
            }
        }

        next();
    }
}
