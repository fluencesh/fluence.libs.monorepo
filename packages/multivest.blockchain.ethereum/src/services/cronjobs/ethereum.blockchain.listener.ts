import { BlockchainListener, JobService, Scheme } from '@applicature-restricted/multivest.services.blockchain';
import { Hashtable, PluginManager } from '@applicature/multivest.core';
import * as abi from 'ethereumjs-abi';
import { sha3 } from 'ethereumjs-util';
import { set } from 'lodash';
import { EthereumTopic, EthereumTopicFilter } from '../../types';
import { EthereumBlockchainService } from '../blockchain/ethereum';

let blockchainId: string;
let networkId: string;

export abstract class EthereumBlockchainListener extends BlockchainListener {
    protected blockchainService: EthereumBlockchainService;

    protected get blockchainId(): string {
        return blockchainId;
    }
    protected get networkId(): string {
        return networkId;
    }

    constructor(
        pluginManager: PluginManager,
        blockchainService: EthereumBlockchainService,
        jobService: JobService,
        sinceBlock: number,
        minConfirmation: number,
        processedBlockHeight: number = 0
    ) {
        // FIXME: bad practice
        blockchainId = blockchainService.getBlockchainId();
        networkId = blockchainService.getNetworkId();

        super(pluginManager, blockchainService, jobService, sinceBlock, minConfirmation, processedBlockHeight);
    }

    protected async getLogsByBlockHeight(height: number) {
        const logsFilters = {
            fromBlock: height,
            toBlock: height,
        } as EthereumTopicFilter;

        return this.blockchainService.getLogs(logsFilters);
    }

    protected async getLogMapByBlockHeight(height: number) {
        const logs = await this.getLogsByBlockHeight(height);
        const logsMap: Hashtable<EthereumTopic> = logs.reduce((map, log) => set(map, log.address, log), {});

        return logsMap;
    }

    protected decodeData(types: Array<string>, data: string) {
        return abi.rawDecode(types, Buffer.from(data, 'utf8'));
    }

    protected attachPrefix(strLine: string) {
        return strLine.indexOf('0x') === 0 ? strLine : `0x${strLine}`;
    }

    protected convertAbiMethodInTopic(abiMethod: Scheme.EthereumContractAbiItem) {
        const types = abiMethod.inputs.map((input) => input.type);
        const eventMethodSignature = `${ abiMethod.name }(${ types.join(',') })`;
        const createContractTopic = this.attachPrefix((sha3(eventMethodSignature) as Buffer).toString('hex'));

        return createContractTopic;
    }
}
