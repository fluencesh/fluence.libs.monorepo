import { NextFunction, Response } from 'express';
import { generateSwaggerYaml } from 'swapi';
import { ProjectRequest } from '../types';
import { Controller } from './controller';

export class SwaggerController extends Controller {
    private swaggerData: string;

    public async getSwaggerFile(req: ProjectRequest, res: Response, next: NextFunction) {
        if (!this.swaggerData) {
            try {
                this.swaggerData = generateSwaggerYaml();
            } catch (ex) {
                return this.handleError(ex, next);
            }
        }

        res.status(200).send(this.swaggerData);
    }
}
