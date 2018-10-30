import { NextFunction, Request, Response } from 'express';
import { Controller } from './controller';

export class PingController extends Controller {
    public ping(req: Request, res: Response, next?: NextFunction) {
        res.status(200).send('pong');
    }
}
