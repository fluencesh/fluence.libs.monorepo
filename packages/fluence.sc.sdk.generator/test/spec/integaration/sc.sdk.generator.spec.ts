import * as archiver from 'archiver';
import { createWriteStream, exists, unlink } from 'fs';
import { resolve } from 'path';
import { promisify } from 'util';
import { EthereumContractAbiItem } from '../../../src';
import { ScSdkGenerator } from '../../../src/services/sc.sdk.generator';

describe('sc.sdk.generator spec', () => {
    let generator: ScSdkGenerator;
    let abi: Array<EthereumContractAbiItem>;

    const zipPath = resolve(__dirname, './test.zip');

    beforeAll(() => {
        generator = new ScSdkGenerator();
        abi = require('../../data/abi.json');
    });
    
    afterAll(async () => {
        const isExists = await promisify(exists)(zipPath);
        if (isExists) {
            await promisify(unlink)(zipPath);
        }
    });

    it('should generate sdk', () => {
        const sdk = generator.generate(abi);

        expect(typeof sdk.declarationText).toEqual('string');
        expect(typeof sdk.jsText).toEqual('string');
        expect(typeof sdk.mapText).toEqual('string');
        expect(typeof sdk.tsText).toEqual('string');
    });

    it('should save zip via write stream', async () => {
        const sdk = generator.generate(abi);

        const ws = createWriteStream(zipPath);
        await generator.convertToZip(sdk, ws);

        const isExists = await promisify(exists)(zipPath);
        expect(isExists).toBeTruthy();
    }, 90000);
});
