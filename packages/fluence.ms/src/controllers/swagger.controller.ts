import { NextFunction, Response } from 'express';
import { createReadStream, readFile } from 'fs';
import { generateSwaggerYaml } from 'swapi';
import { ProjectRequest, SwResponseFormat } from '../types';

export class SwaggerController {
    private swPath: string;

    constructor(swPath: string) {
        this.swPath = swPath;
    }

    public async getSwaggerFile(req: ProjectRequest, res: Response, next: NextFunction) {
        res.status(200).send(generateSwaggerYaml());
    }
}
