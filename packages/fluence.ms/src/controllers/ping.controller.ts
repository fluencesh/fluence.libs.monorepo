import { NextFunction, Request, Response } from 'express';

export class PingController {
    public ping(req: Request, res: Response, next?: NextFunction) {
        res.status(200).send('pong');
    }
}
