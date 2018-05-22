import { createWriteStream } from 'fs';
import * as yaml from 'json2yaml';
import { promisify } from 'util';
import {
    GeneratorOptions,
    SwApi,
    SwApiMethod,
    SwApiMethodParameter,
    SwApiMethodResponse,
    SwApiMethodResponseSchema,
    SwFormat,
} from '../../types';

export class SwAbiGenerator {
    public async generateSwaggerScheme(
        abi: any,
        type: SwFormat,
        host: string,
        basePath: string,
        options: GeneratorOptions = {}
    ): Promise<string> {
        const apiScheme: SwApi = {
            swagger: '2.0',
            host,
            basePath,
            schemes: [ options.https ? 'https' : 'http' ],
            consumes: [ 'application/json' ],
            produces: [ 'application/json' ],
            paths: {}
        } as SwApi;

        abi
            .filter((method: any) => !!method.name && method.type === 'function')
            .forEach((method: any) => {
                const swMethod = this.convertAbiMethodToSw(method);

                apiScheme.paths[`/${method.name}`] = { 'get:': swMethod };
            });

        const swApi: string = type === SwFormat.YAML ? this.toYaml(apiScheme) : JSON.stringify(apiScheme);

        if (options.pathname) {
            await this.save(options.pathname, swApi, type);
        }

        return swApi;
    }

    private convertAbiMethodToSw(abiMethod: any): SwApiMethod {
        const swMethod: SwApiMethod = {
            produces: [ 'application/json' ],
            parameters: [],
            responses: {
                '200:': {} as SwApiMethodResponse
            },
        } as SwApiMethod;

        abiMethod.inputs.forEach((input: any) => {
            swMethod.parameters.push({
                name: input.name,
                type: input.type,
                in: 'query',
            } as SwApiMethodParameter);
        });

        const response = swMethod.responses['200:'];
        response.schema = {
            type: abiMethod.outputs && abiMethod.outputs.length ? 'object' : 'array',
        } as SwApiMethodResponseSchema;

        if (response.schema.type === 'object') {
            response.schema.properties = {};

            abiMethod.outputs.forEach((output: any) => {
                response.schema.properties[output.name] = { type: output.type };
            });
        }

        return swMethod;
    }

    private toYaml(swApi: any): string {
        return yaml
            .stringify(swApi)
            .replace(/::/g, ':')
            .replace(/paths/, 'path');
    }

    private async save(pathname: string, chunk: string, type: SwFormat) {
        const isYaml = type === SwFormat.YAML;
        const buffer = Buffer.alloc(chunk.length, chunk);

        const format = isYaml ? '.yaml' : '.json';
        const ws = createWriteStream(pathname + format, { encoding: 'utf8'});

        return new Promise((resolve, reject) => {
            ws.write(buffer, (err: Error) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}
