import { NextFunction, Response } from 'express';
import { createReadStream, readFile } from 'fs';
import { ProjectRequest, SwResponseFormat } from '../types';

export class SwaggerController {
    private swPath: string;

    constructor(swPath: string) {
        this.swPath = swPath;
    }

    public async getSwaggerFile(req: ProjectRequest, res: Response, next: NextFunction) {
        const asBuffer = req.query.buffer === SwResponseFormat.Buffer;

        if (asBuffer) {
            const swReadStream = createReadStream(this.swPath, { encoding: 'utf8' });

            swReadStream.pipe(res);
        } else {
            const api = await new Promise((resolve, reject) => {
                readFile(this.swPath, { encoding: 'utf8' }, (err, chunk) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(chunk);
                    }
                });
            });

            res.status(200).send(api);
        }
    }
}
