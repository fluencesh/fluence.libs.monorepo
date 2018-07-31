import { NextFunction, Request, Response } from 'express';

export abstract class AuthMiddleware {
    public abstract attachProjectAndClient(req: Request, res: Response, next: NextFunction): void | Promise<void>;
}
