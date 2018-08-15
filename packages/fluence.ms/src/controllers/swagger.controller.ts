import { NextFunction, Response } from 'express';
import { generateSwaggerYaml } from 'swapi';
import { ProjectRequest } from '../types';

export class SwaggerController {
    public async getSwaggerFile(req: ProjectRequest, res: Response, next: NextFunction) {
        res.status(200).send(generateSwaggerYaml());
    }
}
