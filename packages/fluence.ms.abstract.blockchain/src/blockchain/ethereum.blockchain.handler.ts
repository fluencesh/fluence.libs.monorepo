import { Hashtable, PluginManager } from '@applicature/core.plugin-manager';
import {
    EthereumBlockchainService,
    EthereumTopic,
    EthereumTopicFilter,
    EthereumTransaction
} from '@fluencesh/fluence.lib.ethereum';
import { Scheme } from '@fluencesh/fluence.lib.services';
import * as abi from 'ethereumjs-abi';
import { sha3 } from 'ethereumjs-util';
import { set } from 'lodash';
import { BlockchainListenerHandler } from './blockchain.listener.handler';
import { CronjobMetricService } from '../services';

// TODO: integrate with BlockchainListener
export abstract class EthereumBlockchainHandler extends BlockchainListenerHandler<EthereumTransaction> {
    protected blockchainService: EthereumBlockchainService;

    constructor(
        pluginManager: PluginManager,
        ethereumService: EthereumBlockchainService
    ) {
        super(pluginManager, ethereumService);

        this.blockchainService = ethereumService;
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
