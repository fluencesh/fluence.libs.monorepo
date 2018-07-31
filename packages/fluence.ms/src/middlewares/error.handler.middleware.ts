import { MultivestError } from '@applicature-private/multivest.core';
import { NextFunction, Request, Response } from 'express';

export class ErrorHandlerMiddleware {
    public handleError(err: MultivestError, req: Request, res: Response, next: NextFunction) {
        res.status(err.status).send(err.message);
    }
}
