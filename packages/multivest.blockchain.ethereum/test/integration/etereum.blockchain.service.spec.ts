import { PluginManager } from '@applicature-private/multivest.core';
import {
    ContractService,
    DaoCollectionNames,
    MongodbTransportConnectionDao,
    Scheme,
} from '@applicature-private/multivest.services.blockchain';
import BigNumber from 'bignumber.js';
import * as config from 'config';
import { utils } from 'ethers';
import { has } from 'lodash';
import { Db, MongoClient } from 'mongodb';
import { EthereumBlockchainService } from '../../src/services/blockchain/ethereum';
import { ManagedEthereumTransportService } from '../../src/services/transports/managed.ethereum.transport.service';
import { EthereumBlock, EthereumEvent, EthereumTopic, EthereumTopicFilter, EthereumTransaction } from '../../src/types';
import { clearDb } from '../helper';

describe('ethereum blockchain', () => {
    let blockchainService: EthereumBlockchainService;
    let db: Db;
    let pluginManager: PluginManager;
    let contractService: ContractService;
    let randomContract: Scheme.ContractScheme = null;

    const BLOCKCHAIN_ID = 'ETH';
    const NETWORK_ID = 'rinkeby';

    async function initPluginManager() {
        pluginManager = new PluginManager([
            { path: '@applicature-private/multivest.mongodb' },
            { path: '@applicature-private/multivest.services.blockchain' },
        ]);

        await pluginManager.init();
    }

    async function initDb() {
        db = await MongoClient.connect(config.get('multivest.mongodb.url'), {});
    }

    async function createTransportConnections() {
        const transportConnections: Array<Scheme.TransportConnection> = [
            // {
            //     blockchainId: 'ETHEREUM',
            //     networkId: NETWORK_ID,
            //     providerId: 'json-rpc',
            //     settings: {
            //         url: 'http://94.130.216.246:8545'
            //     },
            //     isPrivate: false,
            //     status: Scheme.TransportConnectionStatus.Enabled
            // } as Scheme.TransportConnection,
            {
                blockchainId: 'ETHEREUM',
                networkId: NETWORK_ID,
                providerId: 'json-rpc',
                settings: {
                    url: 'https://rinkeby.infura.io/bXMBS9zEadMgfXd0Y3G1',
                },
                isPrivate: false,
                status: Scheme.TransportConnectionStatus.Enabled
            } as Scheme.TransportConnection
        ];

        const transportConnectionDao = new MongodbTransportConnectionDao(db);

        await Promise.all(transportConnections.map((tc) => transportConnectionDao.createTransportConnection(
            tc.blockchainId,
            tc.networkId,
            tc.providerId,
            tc.priority,
            tc.settings,
            tc.status,
            tc.isFailing,
            tc.lastFailedAt,
            tc.failedCount,
            tc.isPrivate
        )));
    }

    async function initBlockchainService() {
        const managedEthereumTransportService = new ManagedEthereumTransportService(pluginManager, NETWORK_ID);
        await managedEthereumTransportService.init();

        blockchainService = new EthereumBlockchainService(pluginManager, managedEthereumTransportService);
    }

    function isCustomBn(bn: any) {
        return has(bn, '_bn.length') && has(bn, '_bn.negative') && has(bn, '_bn.red') && has(bn, '_bn.words');
    }

    function isLog(log: EthereumTopic) {
        expect(typeof log.address === 'string').toBeTruthy();
        expect(typeof log.blockHash === 'string').toBeTruthy();
        expect(typeof log.data === 'string').toBeTruthy();
        expect(typeof log.logIndex === 'number').toBeTruthy();
        if (log.removed) {
            expect(typeof log.removed === 'boolean').toBeTruthy();
        }
        expect(typeof log.transactionHash === 'string').toBeTruthy();
        expect(typeof log.transactionIndex === 'number').toBeTruthy();
        expect(log.topics).toBeInstanceOf(Array);
        log.topics.forEach((topic) => {
            expect(typeof topic === 'string').toBeTruthy();
        });
    }

    function isBlock(block: EthereumBlock) {
        expect(typeof block.difficulty === 'number').toBeTruthy();
        expect(typeof block.extraData === 'string').toBeTruthy();
        expect(isCustomBn(block.gasLimit)).toBeTruthy();
        expect(isCustomBn(block.gasUsed)).toBeTruthy();
        expect(typeof block.hash === 'string').toBeTruthy();
        expect(typeof block.height === 'number').toBeTruthy();
        expect(typeof block.miner === 'string').toBeTruthy();
        expect(typeof block.network === 'string').toBeTruthy();
        expect(typeof block.parentHash === 'string').toBeTruthy();
        expect(typeof block.time === 'number').toBeTruthy();
        expect(Array.isArray(block.transactions)).toBeTruthy();
    }

    beforeAll(async () => {
        await initDb();
        await clearDb([
            DaoCollectionNames.Contract,
            DaoCollectionNames.TransportConnection,
        ]);
        await initPluginManager();
        await createTransportConnections();
        await initBlockchainService();

        contractService = pluginManager.getServiceByClass(ContractService) as ContractService;
        const randomContractAbi = require('./data/random.contract.abi.json');
        const randomContractAddress = '0x85B887d535736080b235a5ea389C2CD256bD3744';
        randomContract = await contractService.createContract('project id', randomContractAddress, randomContractAbi);
    });

    it('should get block by height', async () => {
        const height = 2103272;

        const result = await blockchainService.getBlockByHeight(height) as EthereumBlock;

        isBlock(result);
    });

    it('should get block by hash', async () => {
        const hash = '0x256e471add784f008cd422ffffbd489a70411ded7b6cf41d6e9ee5ae06121f1b';

        const result = await blockchainService.getBlockByHash(hash) as EthereumBlock;

        isBlock(result);
    });

    it('should get block number', async () => {
        const result = await blockchainService.getBlockHeight();

        expect(typeof result === 'number').toBeTruthy();
    });

    it('should get transaction by hash', async () => {
        const hash = '0x04bb04c61181cd1e82489cd1a220afef696a7b5293bdeb28bd3bc8dee61ce43a';

        const result = await blockchainService.getTransactionByHash(hash) as EthereumTransaction;

        expect(typeof result.blockHash === 'string').toBeTruthy();
        expect(typeof result.blockHeight === 'number').toBeTruthy();
        // expect(body.fee).toBeTruthy(); // FIXME: fee is always null
        expect(isCustomBn(result.gasPrice)).toBeTruthy();
        expect(typeof result.hash === 'string').toBeTruthy();
        expect(typeof result.nonce === 'number').toBeTruthy();
        expect(typeof result.transactionIndex === 'number').toBeTruthy();

        expect(result.from instanceof Array).toBeTruthy();
        result.from.forEach((from: any) => {
            expect(Object.keys(from)).toEqual([ 'address' ]);
            expect(typeof from.address === 'string').toBeTruthy();
        });

        expect(result.to instanceof Array).toBeTruthy();
        result.to.forEach((to: any) => {
            expect(Object.keys(to)).toEqual([ 'address', 'amount' ]);
            expect(typeof to.address === 'string').toBeTruthy();
            expect(isCustomBn(to.amount)).toBeTruthy();
        });
    });

    it('should call contract\'s method', async () => {
        const tx = {
            to: [ { address: '0xab13665b08d9dfcb6a323ed9148e5fe74ea15ca3' } ],
            input: utils.id('name()').substring(0, 10),
        } as any as EthereumTransaction;

        const result = await blockchainService.call(tx);

        expect(typeof result === 'string').toBeTruthy();
    });

    it('should get balance by address', async () => {
        const address = '0xab13665b08d9dfcb6a323ed9148e5fe74ea15ca3';

        const result = await blockchainService.getBalance(address, null);

        expect(isCustomBn(result)).toBeTruthy();
    });

    it('should get estimated gas', async () => {
        const tx = {
            to: [ { address: '0x1d45e9Ac123985c8F8F67387caE9CdFd9B24AeF3' } ],
            input: utils.id('mintingFinished()').substring(0, 10),
        } as any as EthereumTransaction;

        const result = await blockchainService.estimateGas(tx);

        expect(isCustomBn(result)).toBeTruthy();
    });

    it('should get gas price', async () => {
        const result = await blockchainService.getGasPrice();

        expect(isCustomBn(result)).toBeTruthy();
    });

    it('should get code', async () => {
        const address = '0xab13665b08d9dfcb6a323ed9148e5fe74ea15ca3';

        const result = await blockchainService.getCode(address);

        expect(typeof result === 'string').toBeTruthy();
    });

    it('should get code', async () => {
        const filters = {
            fromBlock: 2103272,
            get toBlock() { return this.fromBlock + 10; }
        } as EthereumTopicFilter;

        const result = await blockchainService.getLogs(filters);

        expect(result).toBeInstanceOf(Array);
        result.forEach((log) => isLog(log));
    });

    it('should get tx receipt', async () => {
        const txHash = '0x64970da96d02f0aec2c1b008e0ac1b7cb7700231a4c27ca3f1d11dd1873c9de9';

        const result = await blockchainService.getTransactionReceipt(txHash);

        expect(typeof result.blockHash === 'string').toBeTruthy();
        expect(typeof result.blockNumber === 'number').toBeTruthy();
        expect(typeof result.byzantium === 'boolean').toBeTruthy();
        expect(result.contractAddress).toBeNull();
        expect(typeof result.cumulativeGasUsed === 'string').toBeTruthy();
        expect(typeof result.gasUsed === 'number').toBeTruthy();
        expect(typeof result.logsBloom === 'string').toBeTruthy();
        expect(typeof result.status === 'number').toBeTruthy();
        expect(typeof result.transactionHash === 'string').toBeTruthy();
        expect(typeof result.transactionIndex === 'number').toBeTruthy();
        expect(result.logs).toBeInstanceOf(Array);
        result.logs.forEach((log) => isLog(log));
    });

    it('should tx count', async () => {
        const address = '0xa10F52b30260A11f0Accc8DEaeF3237ae40352F8';

        const result = await blockchainService.getAddressTransactionsCount(address);

        expect(typeof result === 'number').toBeTruthy();
    });

    it('should tx count (block filter)', async () => {
        const address = '0xa10F52b30260A11f0Accc8DEaeF3237ae40352F8';
        const blockHeight = 2152749;

        const result = await blockchainService.getAddressTransactionsCount(address, blockHeight);

        expect(typeof result === 'number').toBeTruthy();
    });

    it('should call contract\'s method (without input & single output)', async () => {
        const methodName = 'name';
        // tslint:disable-next-line:no-shadowed-variable
        const methodAbi = randomContract.abi.find((methodAbi) => methodAbi.name === methodName);

        const result = await blockchainService.callContractMethod(randomContract, methodName);

        methodAbi.outputs.forEach((output) => {
            expect(typeof result[output.name] === 'string').toBeTruthy();
        });
    });

    it('should call contract\'s method (with input & multiply output)', async () => {
        const methodName = 'allOf';
        // tslint:disable-next-line:no-shadowed-variable
        const methodAbi = randomContract.abi.find((methodAbi) => methodAbi.name === methodName);

        const types = ['uint256'];
        const values = ['1'];

        const result = await blockchainService.callContractMethod(randomContract, methodName, types, values);

        methodAbi.outputs.forEach((output) => {
            expect(typeof result[output.name] === 'string').toBeTruthy();
        });
    });

    it('should get gas estimate of contract\'s method (without input & single output)', async () => {
        const methodName = 'name';
        // tslint:disable-next-line:no-shadowed-variable
        const methodAbi = randomContract.abi.find((methodAbi) => methodAbi.name === methodName);

        const result = await blockchainService.contractMethodGasEstimate(randomContract, methodName);

        expect(isCustomBn(result)).toBeTruthy();
        expect(result.toString()).toEqual('0');
    });

    it('should call contract\'s method (with input & multiply output)', async () => {
        const methodName = 'allOf';
        // tslint:disable-next-line:no-shadowed-variable
        const methodAbi = randomContract.abi.find((methodAbi) => methodAbi.name === methodName);

        const types = ['uint256'];
        const values = ['1'];

        const result = await blockchainService.contractMethodGasEstimate(randomContract, methodName, types, values);

        expect(isCustomBn(result)).toBeTruthy();
        expect(result.toString()).toEqual('0');
    });
});
