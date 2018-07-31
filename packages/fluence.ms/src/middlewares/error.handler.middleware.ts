import { MultivestError } from '@fluencesh/multivest.core';
import { NextFunction, Request, Response } from 'express';

export class ErrorHandlerMiddleware {
    public handleError(err: MultivestError, req: Request, res: Response, next: NextFunction) {
        res.status(err.status).send(err.message);
    }
}
