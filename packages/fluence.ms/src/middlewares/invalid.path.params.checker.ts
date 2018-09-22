import { WebMultivestError } from '@fluencesh/multivest.web';
import { NextFunction, Response } from 'express';
import { Errors } from '../errors';
import { ProjectRequest } from '../types';

export class InvalidPathParamsChecker {
    private clientResourceName: string;
    private projectResourceName: string;

    constructor(
        clientResourceName = 'clients',
        projectResourceName = 'projects',
    ) {
        this.clientResourceName = clientResourceName;
        this.projectResourceName = projectResourceName;
    }

    public validate(req: ProjectRequest, res: Response, next: NextFunction) {
        const { clientId, projectId } = req.originalUrl
            .split('/').reduce((clientProjectIds: any, pathPart, index, pathArray) => {
                if (index !== 0 && pathArray[index - 1] === this.clientResourceName) {
                    clientProjectIds.clientId = pathPart;
                } else if (index !== 0 && pathArray[index - 1] === this.projectResourceName) {
                    clientProjectIds.projectId = pathPart;
                }

                return clientProjectIds;
            }, {});

        if (clientId !== undefined && req.relatedClient && clientId !== req.relatedClient.id) {
            return next(new WebMultivestError(Errors.CLIENT_ID_IN_PATH_AND_IN_QUERY_ARE_DIFFERENT, 400));
        } else if (projectId !== undefined && req.project && projectId !== req.project.id) {
            return next(new WebMultivestError(Errors.PROJECT_ID_IN_PATH_AND_IN_QUERY_ARE_DIFFERENT, 400));
        }

        next();
    }
}
