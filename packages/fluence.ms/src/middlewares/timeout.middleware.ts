import * as config from 'config';
import { NextFunction, Request, Response } from 'express';

export class TimeoutMiddleware {
    private timeout: number;

    public constructor(timeout: number) {
        this.timeout = timeout;
    }

    public setTimeout() {
        const timeout = this.timeout;

        return (req: Request, res: Response, next: NextFunction) => {
            req.setTimeout(timeout, () => {
                res.status(408).end();
            });
    
            next();
        };
    }
}
