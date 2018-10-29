import { PluginManager, Service } from '@applicature/core.plugin-manager';
import { Scheme } from '@fluencesh/fluence.lib.services';
import Axios, { AxiosRequestConfig } from 'axios';
import { format } from 'util';
import * as logger from 'winston';
import { ServiceIds } from '../../constants';
import { Errors } from '../../errors';
import { EthereumBlockchainService } from './ethereum';

export class BatchService extends Service {
    private blockchainService: EthereumBlockchainService;

    constructor(
        pluginManager: PluginManager,
        blockchainService: EthereumBlockchainService
    ) {
        super(pluginManager);

        this.blockchainService = blockchainService;
    }

    public getServiceId() {
        return ServiceIds.BatchService;
    }

    public async contractMethodBatchCall(
        contractEntity: Scheme.ContractScheme,
        methodName: string,
        inputTypes: Array<string>,
        inputValuesData: Array<Array<string>>,
        rowPerRequest: number,
        webhookUrl: string
    ): Promise<void> {
        const batchCaller = this.getBatchContractMethodCaller(
            contractEntity,
            methodName,
            inputTypes,
            inputValuesData,
            rowPerRequest
        );

        const allResults = [];

        let done: boolean = false;
        do {
            const batchData = batchCaller.next();
            done = batchData.done;

            if (!done) {
                const batchCallResult = await batchData.value;
                await this.sendResults(webhookUrl, done, batchCallResult);

                allResults.push(...batchCallResult);
            }
        } while (done !== true);

        await this.sendResults(webhookUrl, done, allResults);

        return;
    }

    private * getBatchContractMethodCaller(
        contractEntity: Scheme.ContractScheme,
        methodName: string,
        inputTypes: Array<string>,
        inputValuesData: Array<Array<string>>,
        rowPerRequest: number
    ) {
        const allCalls: Array<Promise<any>> = [];

        const iterationsCount = Math.ceil(inputValuesData.length / rowPerRequest);
        for (let iterationNo = 0; iterationNo < iterationsCount; iterationNo++) {
            const batchCalls: Array<Promise<any>> = [];

            for (let rowIndex = 0; rowIndex < rowPerRequest; rowIndex++) {
                const inputValueIndex = iterationNo * rowPerRequest + rowIndex;
                const inputValues = inputValuesData[inputValueIndex];

                if (!inputValues) {
                    continue;
                }

                batchCalls.push(
                    this.blockchainService.callContractMethod(contractEntity, methodName, inputTypes, inputValues)
                );
            }

            yield Promise.all(batchCalls);

            allCalls.push(...batchCalls);
        }
    }

    private async sendResults(webhookUrl: string, done: boolean, results: Array<any>) {
        const requestConfig = {
            url: webhookUrl,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                done,
                results,
                timestamp: Date.now()
            }
        } as AxiosRequestConfig;

        try {
            await Axios(requestConfig);
        } catch (ex) {
            logger.error(format(Errors.WEBHOOK_SENDING_FAILED, ex));
        }

        return;
    }
}
