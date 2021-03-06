import { MultivestError, PluginManager, Service } from '@applicature/synth.plugin-manager';
import { Scheme } from '@fluencesh/fluence.lib.services';
import { BigNumber } from 'bignumber.js';
import { Contract, providers } from 'ethers';
import { ServiceIds, TransportIds } from '../../constants';
import {
    ETHEREUM,
    EthereumBlock,
    EthereumTopic,
    EthereumTopicFilter,
    EthereumTransaction,
    EthereumTransactionReceipt,
    ethereumValidNetworks,
} from '../../types';
import { EthereumTransportProvider } from './interfaces';

export enum Provider {
    JsonRpc = 'json-rpc',
    Etherscan = 'etherscan',
    Infura = 'infura'
}

export class EthersEthereumTransportService extends Service implements EthereumTransportProvider {
    private network: string;
    private provider: any;
    private transportConnection: Scheme.TransportConnection;

    constructor(pluginManager: PluginManager, transportConnection: Scheme.TransportConnection) {
        super(pluginManager);

        this.transportConnection = transportConnection;
        this.network = this.transportConnection.networkId;

        if (ethereumValidNetworks.indexOf(this.network) === -1) {
            throw new MultivestError('unknown network');
        }

        const url = this.transportConnection.settings.url;
        const apiToken = this.transportConnection.settings.apiUrl;

        if (transportConnection.providerId === Provider.Infura) {
            this.provider = new providers.InfuraProvider(this.network, apiToken);
        } else if (transportConnection.providerId === Provider.Etherscan) {
            this.provider = new providers.EtherscanProvider(this.network, apiToken);
        } else if (transportConnection.providerId === Provider.JsonRpc) {
            this.provider = new providers.JsonRpcProvider(url, this.network);
        } else {
            throw new MultivestError('unknown provider');
        }
    }

    public getNetworkId(): string {
        return this.network;
    }

    public getServiceId(): string {
        return ServiceIds.EthersEthereumTransportService;
    }

    public getTransportId(): string {
        return TransportIds.EthersEthereumTransportService;
    }

    public getBlockchainId(): string {
        return ETHEREUM;
    }

    public getTransportConnection() {
        return this.transportConnection;
    }

    public async getBlockByHash(hash: string): Promise<EthereumBlock> {
        const block = await this.provider.getBlock(hash);

        block.transactions = await Promise.all(
            block.transactions.map((txHash: string) => this.getTransactionByHash(txHash))
        );

        return this.convertBlock(block);
    }

    public getBlockHeight(): Promise<number> {
        return this.provider.getBlockNumber();
    }

    public async getBlockByHeight(blockHeight: number): Promise<EthereumBlock> {
        const block = await this.provider.getBlock(blockHeight);

        block.transactions = await Promise.all(
            block.transactions.map((txHash: string) => this.getTransactionByHash(txHash))
        );

        return this.convertBlock(block);
    }

    public async getTransactionByHash(txHash: string) {
        const tx = await this.provider.getTransaction(txHash);

        return this.convertTransaction(tx);
    }

    public async sendRawTransaction(txHex: string, projectId?: string): Promise<EthereumTransaction> {
        const hash = this.provider.sendTransaction(txHex);

        return this.getTransactionByHash(hash);
    }

    public async call(tx: EthereumTransaction): Promise<string> {
        return this.provider.call({
            to: tx.to[0].address,
            nonce: tx.nonce,
            gasLimit: tx.gasLimit,
            gasPrice: tx.gasPrice,
            data: tx.input,
            value: tx.to[0].amount
        });
    }

    public async getBalance(address: string, minConf: number) {
        if (minConf && minConf > 0) {
            throw new MultivestError('minConf is not supported');
        }

        return this.provider.getBalance(address);
    }

    public async estimateFee(tx: EthereumTransaction): Promise<BigNumber> {
        return this.provider.estimateGas({
            to: tx.to[0].address,
            nonce: tx.nonce,
            gasLimit: tx.gasLimit,
            gasPrice: tx.gasPrice,
            data: tx.input,
            value: tx.to[0].amount
        });
    }

    public async getFeePrice(): Promise<BigNumber> {
        const price = (await this.provider.getGasPrice()) as BigNumber;

        return price;
    }

    public async getCode(address: string): Promise<string> {
        return this.provider.getCode(address);
    }

    public async getLogs(filters: EthereumTopicFilter): Promise<Array<EthereumTopic>> {
        return this.provider.getLogs(filters);
    }

    public async getTransactionReceipt(txHex: string): Promise<EthereumTransactionReceipt> {
        const receipt = await this.provider.getTransactionReceipt(txHex);

        return this.convertTransactionReceipt(receipt);
    }

    public async getAddressTransactionsCount(address: string, blockTag?: number | string): Promise<number> {
        const count: number = await this.provider.getTransactionCount(address, blockTag);

        return count;
    }

    public async callContractMethod(
        contractEntity: Scheme.ContractScheme,
        methodName: string,
        inputTypes: Array<string> = [],
        inputValues: Array<string | Array<string>> = []
    ) {
        const contract = new Contract(contractEntity.address, contractEntity.abi, this.provider);

        const methodSignature = `${methodName}(${inputTypes.join(',')})`;
        const result: Array<any> | any = await contract.functions[methodSignature](...inputValues);

        // tslint:disable-next-line:no-shadowed-variable
        const abiItem = contractEntity.abi.find((abiItem) => {
            if (abiItem.name === methodName) {
                const isMatch = !abiItem.inputs.find((input, index) => input.type !== inputTypes[index]);

                return isMatch;
            }
        });

        return this.convertContractMethodResponse(abiItem, result);
    }

    public async contractMethodFeeEstimate(
        contractEntity: Scheme.ContractScheme,
        methodName: string,
        inputTypes: Array<string> = [],
        inputValues: Array<string | Array<string>> = []
    ): Promise<BigNumber> {
        const contract = new Contract(contractEntity.address, contractEntity.abi, this.provider);
        const methodSignature = `${methodName}(${inputTypes.join(',')})`;

        return contract.estimate[methodSignature](...inputValues);
    }

    private convertContractMethodResponse(abiItem: Scheme.EthereumContractAbiItem, result: Array<any> | any): any {
        // NOTICE: if output length === 1 then result will be a value.
        // NOTICE: if output length > 1 then result will be an Array.

        result = abiItem.outputs.length > 1 ? result : [result];
        if (!abiItem) {
            return result.map((value: any) => value.toString());
        }

        const dto: any = {};
        result.forEach((value: any, index: number) => {
            const output = abiItem.outputs[index];
            const isArray = output.type.indexOf('[]') !== -1 && value instanceof Array;
            const name = output.name;

            dto[name] = isArray ? value.map((item: any) => item.toString()) : value.toString();
        });
        return dto;
    }

    private convertBlock(block: any): EthereumBlock {
        return {
            height: block.number,
            hash: block.hash,
            parentHash: block.parentHash,
            difficulty: block.difficulty,
            time: block.timestamp,
            nonce: block.nonce,

            network: ETHEREUM,
            size: block.size,
            transactions: block.transactions as Array<EthereumTransaction>,
            fee: null, // @TODO: define

            sha3Uncles: block.sha3Uncles,
            logsBloom: block.logsBloom,
            transactionsRoot: block.transactionsRoot,
            stateRoot: block.stateRoot,
            receiptsRoot: block.receiptsRoot,
            miner: block.miner,
            totalDifficulty: block.totalDifficulty,
            extraData: block.extraData,
            gasLimit: block.gasLimit,
            gasUsed: block.gasUsed,
            uncles: block.uncles
        };
    }

    private convertTransaction(tx: any): EthereumTransaction {
        return {
            hash: tx.hash,
            blockHash: tx.blockHash,
            blockHeight: tx.blockNumber,

            fee: new BigNumber(tx.gasPrice.toString()).multipliedBy(tx.gasLimit.toString()),
            from: [{ address: tx.from }],
            to: [{
                address: tx.to,
                amount: tx.value
            }],

            gasLimit: new BigNumber(tx.gasLimit.toString()),
            gasPrice: new BigNumber(tx.gasPrice.toString()),
            nonce: tx.nonce,
            input: tx.input,
            transactionIndex: tx.transactionIndex
        } as EthereumTransaction;
    }

    private convertTransactionReceipt(receipt: any): EthereumTransactionReceipt {
        const cumulativeGasUsed = receipt.cumulativeGasUsed
            ? receipt.cumulativeGasUsed.toString()
            : receipt.cumulativeGasUsed;

        return {
            blockHash: receipt.blockHash,
            blockNumber: receipt.blockNumber,
            byzantium: receipt.byzantium,
            contractAddress: receipt.contractAddress,
            cumulativeGasUsed,
            from: receipt.from,
            gasUsed: receipt.gasUsed ? receipt.gasUsed.toNumber() : receipt.gasUsed,
            logs: receipt.logs,
            logsBloom: receipt.logsBloom,
            root: receipt.root,
            status: receipt.status,
            transactionHash: receipt.transactionHash,
            transactionIndex: receipt.transactionIndex,
        } as EthereumTransactionReceipt;
    }
}
