import { exists, readFile, unlink } from 'fs';
import { SwAbiGenerator } from '../../src/services/helpers/sw.abi.generator';
import { SwApi, SwFormat } from '../../src/types';

describe('abi to sw generator', () => {
    let generator: SwAbiGenerator;
    let abi: any;
    let host: string;
    let basePath: string;
    let pathname: string;

    beforeAll(() => {
        generator = new SwAbiGenerator();
        abi = require('./data/random.contract.abi.json');
        host = 'example.com';
        basePath = 'contract/0x000000000/method';
        pathname = './sw';
    });

    afterEach(async () => {
        await Promise.all(
            ['.yaml', '.json'].map(async (format) => {
                const fullpath = pathname + format;
                const isExists = await new Promise((resolve, reject) => {
                    exists(fullpath, (exists) => { // tslint:disable-line:no-shadowed-variable
                        resolve(exists);
                    });
                });

                if (isExists) {
                    await new Promise((resolve, reject) => {
                        unlink(fullpath, (err) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve();
                            }
                        });
                    });
                }
            })
        );
    });

    it('should convert to json', async () => {
        const swScheme = await generator.generateSwaggerScheme(
            abi, SwFormat.JSON, host, basePath
        );

        expect(typeof swScheme).toEqual('string');

        const jsonScheme: SwApi = JSON.parse(swScheme);
        expect(typeof jsonScheme.basePath).toEqual('string');
        expect(typeof jsonScheme.host).toEqual('string');
        expect(typeof jsonScheme.swagger).toEqual('string');

        expect(jsonScheme.consumes).toBeInstanceOf(Array);
        jsonScheme.consumes.forEach((consume) => expect(typeof consume).toEqual('string'));
        expect(jsonScheme.produces).toBeInstanceOf(Array);
        jsonScheme.produces.forEach((produce) => expect(typeof produce).toEqual('string'));
        expect(jsonScheme.schemes).toBeInstanceOf(Array);
        jsonScheme.schemes.forEach((scheme) => expect(typeof scheme).toEqual('string'));

        Object.keys(jsonScheme.paths).forEach((path) => {
            const methods = jsonScheme.paths[path];
            Object.keys(methods).forEach((method) => {
                const methodDeclaration = methods[method];
                
                // tslint:disable-next-line:no-shadowed-variable
                const abiMethod = abi.find((abiMethod: any) => {
                    const swInputs = methodDeclaration.parameters.map((param) => param.name);

                    return abiMethod.name === path.replace(/\//g, '')
                        && !abiMethod.inputs.find((input, index) => swInputs.indexOf(input.name) !== index);
                });

                expect(methodDeclaration.parameters).toBeInstanceOf(Array);
                expect(methodDeclaration.parameters.length).toEqual(abiMethod.inputs.length);
                abiMethod.inputs.forEach((input, index) => {
                    const swParam = methodDeclaration.parameters[index];

                    expect(typeof swParam.in).toEqual('string');
                    expect(typeof swParam.name).toEqual('string');
                    expect(swParam.name).toEqual(input.name);
                    expect(typeof swParam.type).toEqual('string');
                    expect(swParam.type).toEqual(input.type);

                    // optional params
                    expect(typeof (swParam.collectionFormat || '')).toEqual('string');
                    expect(typeof (swParam.description || '')).toEqual('string');
                    expect(swParam.items || []).toBeInstanceOf(Array);
                    expect(typeof (swParam.required || false)).toEqual('boolean');
                });

                Object.keys(methodDeclaration.responses).forEach((status) => {
                    const response = methodDeclaration.responses[status];

                    expect(typeof response.schema.type).toEqual('string');
                    if (response.schema.items || response.schema.properties) {
                        expect(typeof (response.schema.items || response.schema.properties)).toEqual('object');
    
                        if (response.schema.items) {
                            expect(typeof (response.schema.items.$ref || response.schema.items.type)).toEqual('string');
                        }
    
                        if (response.schema.properties) {
                            expect(Object.keys(response.schema.properties).length).toEqual(abiMethod.outputs.length);
                            abiMethod.outputs.forEach((abiOutput) => {
                                const outputDeclaration = response.schema.properties[abiOutput.name];
    
                                expect(outputDeclaration).toBeTruthy();
                                expect(outputDeclaration.type).toEqual(abiOutput.type);
                            });
                        }
                    }

                    // optional params
                    expect(typeof (response.description || '')).toEqual('string');
                });

                // optional params
                expect(typeof (methodDeclaration.description || '')).toEqual('string');
                expect(typeof (methodDeclaration.operationId || '')).toEqual('string');
                expect(methodDeclaration.produces || []).toBeInstanceOf(Array);
            });
        });
    });

    it('should convert to json and save in FS', async () => {
        const swScheme = await generator.generateSwaggerScheme(
            abi, SwFormat.JSON, host, basePath, { pathname }
        );

        const fsSwScheme = await new Promise((resolve, reject) => {
            readFile(`${pathname}.json`, (err: Error, data: Buffer) => {
                if (err) {
                    reject(err);
                } else {
                    const chunk = data.toString('utf8');

                    resolve(chunk);
                }
            });
        });

        expect(swScheme).toEqual(fsSwScheme);
    });

    it('should convert to yaml', async () => {
        const swScheme = await generator.generateSwaggerScheme(
            abi, SwFormat.YAML, host, basePath
        );

        expect(typeof swScheme).toEqual('string');
    });

    it('should convert to yaml and save in FS', async () => {
        const swScheme = await generator.generateSwaggerScheme(
            abi, SwFormat.YAML, host, basePath, { pathname }
        );

        const fsSwScheme = await new Promise((resolve, reject) => {
            readFile(`${pathname}.yaml`, (err: Error, data: Buffer) => {
                if (err) {
                    reject(err);
                } else {
                    const chunk = data.toString('utf8');

                    resolve(chunk);
                }
            });
        });

        expect(swScheme).toEqual(fsSwScheme);
    });
});
