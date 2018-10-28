import * as archiver from 'archiver';
import { template, TemplateExecutor } from 'lodash';
import { Writable } from 'stream';
import * as ts from 'typescript';
import { sdkDeclaration, sdkTemplateTs } from '../constants';
import { EthereumContractAbiItem, EthereumContractAbiItemTemplate, SdkData, SdkJsData } from '../types';

export class ScSdkGenerator {
    private tsTemplateExecutor: TemplateExecutor;
    private declarationTemplateExecutor: TemplateExecutor;

    constructor() {
        this.tsTemplateExecutor = template(sdkTemplateTs);
        this.declarationTemplateExecutor = template(sdkDeclaration);
    }

    public generate(
        abi: Array<EthereumContractAbiItem>,
        className: string = 'SmartContractProvider',
    ): SdkData {
        const templateData: Array<EthereumContractAbiItemTemplate> = [];

        for (const method of abi) {
            const name = method.name;

            if (!name || !method.inputs) {
                continue;
            }

            const inputTypes = method.inputs
                .map((input) => `'${ input.type }'`)
                .join(', ');

            const methodParamsSignature = method.inputs
                .reduce((signature, input) => {
                    signature += `${ input.name }: string, `;
                    return signature;
                }, '')
                .replace(/, $/, '');

            templateData.push({ inputTypes, name, methodParamsSignature });
        }

        const output = {} as SdkData;

        output.tsText = this.tsTemplateExecutor({ methods: templateData, className });

        output.declarationText = this.declarationTemplateExecutor({ methods: templateData, className });

        const jsData = this.convertToJs(output.tsText);
        output.jsText = jsData.jsText;
        output.mapText = jsData.mapText;

        return output;
    }

    public convertToZip(data: SdkData, output: Writable, compressLevel: number = 0): Promise<void> {
        const archive = archiver('zip', {
            encoding: 'utf-8',
            gzip: true,
            gzipOptions: { level: compressLevel },
        });

        return new Promise((resolve, reject) => {
            output.on('close', resolve);
            archive.on('error', reject);

            archive.pipe(output);

            archive.append(data.declarationText, { name: 'index.d.ts' });
            archive.append(data.jsText, { name: 'index.js' });
            archive.append(data.mapText, { name: 'index.js.map' });
            archive.append(data.tsText, { name: 'index.ts' });

            archive.finalize();
        });
    }

    private convertToJs(tsText: string): SdkJsData {
        const jsData = ts.transpileModule(tsText, {
            compilerOptions: {
                module: ts.ModuleKind.CommonJS,
                sourceMap: true,
                target: ts.ScriptTarget.ESNext,
            }
        });

        return {
            jsText: jsData.outputText,
            mapText: jsData.sourceMapText,
        } as SdkJsData;
    }
}
