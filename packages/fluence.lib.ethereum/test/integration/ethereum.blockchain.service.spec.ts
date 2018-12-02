import { PluginManager } from '@applicature/synth.plugin-manager';
import {
    ContractService,
    DaoCollectionNames,
    MongodbTransportConnectionDao,
    Scheme,
} from '@fluencesh/fluence.lib.services';
import * as config from 'config';
import { utils } from 'ethers';
import { has } from 'lodash';
import { Db, MongoClient } from 'mongodb';
import { EthereumBlockchainService } from '../../src/services/blockchain/ethereum';
import { ManagedEthereumTransportService } from '../../src/services/transports/managed.ethereum.transport.service';
import { EthereumBlock, EthereumTopic, EthereumTopicFilter, EthereumTransaction } from '../../src/types';
import { clearCollections } from '../helpers';

describe('ethereum blockchain', () => {
    let blockchainService: EthereumBlockchainService;
    let connection: MongoClient;
    let db: Db;
    let pluginManager: PluginManager;
    let contractService: ContractService;
    let randomContract: Scheme.ContractScheme = null;

    let transportConnectionId: string = null;

    const BLOCKCHAIN_ID = 'ETH';
    const NETWORK_ID = 'rinkeby';

    async function initPluginManager() {
        pluginManager = new PluginManager([
            { path: '@applicature/synth.mongodb' },
            { path: '@fluencesh/fluence.lib.services' },
        ]);

        await pluginManager.init();
    }

    async function createTransportConnection() {
        const transportConnection = {
            blockchainId: 'ETHEREUM',
            networkId: NETWORK_ID,
            providerId: 'json-rpc',
            settings: {
                url: config.get('multivest.blockchain.ethereum.providers.native.url'),
            },
            isPrivate: false,
            status: Scheme.TransportConnectionStatus.Enabled
        } as Scheme.TransportConnection;

        const transportConnectionDao = new MongodbTransportConnectionDao(db);

        const created = await transportConnectionDao.createTransportConnection(
            transportConnection.blockchainId,
            transportConnection.networkId,
            transportConnection.providerId,
            transportConnection.priority,
            transportConnection.settings,
            transportConnection.status,
            transportConnection.isFailing,
            transportConnection.lastFailedAt,
            transportConnection.failedCount,
            transportConnection.isPrivate,
            null
        );

        transportConnectionId = created.id;
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
        connection = await MongoClient.connect(config.get('multivest.mongodb.url'), {});
        db = connection.db(config.get('multivest.mongodb.dbName'));

        await clearCollections(db, [
            DaoCollectionNames.Contract,
            DaoCollectionNames.TransportConnection,
        ]);

        await createTransportConnection();
        await initPluginManager();
        await initBlockchainService();

        contractService = pluginManager.getServiceByClass(ContractService) as ContractService;
        const randomContractAbi = require('./data/random.contract.abi.json');
        const randomContractAddress = '0x85B887d535736080b235a5ea389C2CD256bD3744';
        randomContract = await contractService.createContract('project id', randomContractAddress, randomContractAbi);
    });

    afterAll(async () => {
        await connection.close();
    });

    it('should get block by height', async () => {
        const height = 2103272;

        const result = await blockchainService.getBlockByHeight(height, transportConnectionId);

        isBlock(result);
    });

    it('should get block by hash', async () => {
        const hash = '0x256e471add784f008cd422ffffbd489a70411ded7b6cf41d6e9ee5ae06121f1b';

        const result = await blockchainService.getBlockByHash(hash, transportConnectionId);

        isBlock(result);
    });

    it('should get block number', async () => {
        const result = await blockchainService.getBlockHeight(transportConnectionId);

        expect(typeof result === 'number').toBeTruthy();
    });

    it('should get transaction by hash', async () => {
        const hash = '0x04bb04c61181cd1e82489cd1a220afef696a7b5293bdeb28bd3bc8dee61ce43a';

        const result = await blockchainService.getTransactionByHash(hash, transportConnectionId);

        expect(typeof result.blockHash === 'string').toBeTruthy();
        expect(typeof result.blockHeight === 'number').toBeTruthy();
        expect(result.fee.constructor.name).toEqual('BigNumber');
        expect(result.gasPrice.constructor.name).toEqual('BigNumber');
        expect(result.gasLimit.constructor.name).toEqual('BigNumber');
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

        const result = await blockchainService.call(tx, transportConnectionId);

        expect(typeof result === 'string').toBeTruthy();
    });

    it('should get balance by address', async () => {
        const address = '0xab13665b08d9dfcb6a323ed9148e5fe74ea15ca3';

        const result = await blockchainService.getBalance(address, null, transportConnectionId);

        expect(isCustomBn(result)).toBeTruthy();
    });

    it('should get estimated gas', async () => {
        const tx = {
            to: [ { address: '0x1d45e9Ac123985c8F8F67387caE9CdFd9B24AeF3' } ],
            input: utils.id('mintingFinished()').substring(0, 10),
        } as any as EthereumTransaction;

        const result = await blockchainService.estimateFee(tx, transportConnectionId);

        expect(isCustomBn(result)).toBeTruthy();
    });

    it('should get gas price', async () => {
        const result = await blockchainService.getFeePrice(transportConnectionId);

        expect(isCustomBn(result)).toBeTruthy();
    });

    it('should get code', async () => {
        const address = '0xab13665b08d9dfcb6a323ed9148e5fe74ea15ca3';

        const result = await blockchainService.getCode(address, transportConnectionId);

        expect(typeof result === 'string').toBeTruthy();
    });

    it('should get code', async () => {
        const filters = {
            fromBlock: 2103272,
            get toBlock() { return this.fromBlock + 10; }
        } as EthereumTopicFilter;

        const result = await blockchainService.getLogs(filters, transportConnectionId);

        expect(result).toBeInstanceOf(Array);
        result.forEach((log) => isLog(log));
    });

    it('should get tx receipt', async () => {
        const txHash = '0x64970da96d02f0aec2c1b008e0ac1b7cb7700231a4c27ca3f1d11dd1873c9de9';

        const result = await blockchainService.getTransactionReceipt(txHash, transportConnectionId);

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

        const result = await blockchainService.getAddressTransactionsCount(address, transportConnectionId);

        expect(typeof result === 'number').toBeTruthy();
    });

    // FIXME: throws error: "missing trie node e0e2173cff99b48a9797cb8f3c3faa56186efc7435b8c9d8117946e625747960 (path )"
    // https://applicature.atlassian.net/browse/FLC-234
    it.skip('should tx count (block filter)', async () => {
        const address = '0xa10F52b30260A11f0Accc8DEaeF3237ae40352F8';
        const blockHeight = 3356841;

        const result = await blockchainService.getAddressTransactionsCount(address, transportConnectionId, blockHeight);
        expect(typeof result === 'number').toBeTruthy();
    });

    it('should call contract\'s method (without input & single output)', async () => {
        const methodName = 'name';
        // tslint:disable-next-line:no-shadowed-variable
        const methodAbi = randomContract.abi.find((methodAbi) => methodAbi.name === methodName);

        const result = await blockchainService.callContractMethod(
            randomContract, methodName, [], [], transportConnectionId
        );

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

        const result = await blockchainService.callContractMethod(
            randomContract, methodName, types, values, transportConnectionId
        );

        methodAbi.outputs.forEach((output) => {
            expect(typeof result[output.name] === 'string').toBeTruthy();
        });
    });

    it('should get gas estimate of contract\'s method (without input & single output)', async () => {
        const methodName = 'name';
        // tslint:disable-next-line:no-shadowed-variable
        const methodAbi = randomContract.abi.find((methodAbi) => methodAbi.name === methodName);

        const result = await blockchainService.contractMethodFeeEstimate(
            randomContract, methodName, [], [], transportConnectionId
        );

        expect(isCustomBn(result)).toBeTruthy();
        expect(result.toString()).toEqual('0');
    });

    it('should call contract\'s method (with input & multiply output)', async () => {
        const methodName = 'allOf';
        // tslint:disable-next-line:no-shadowed-variable
        const methodAbi = randomContract.abi.find((methodAbi) => methodAbi.name === methodName);

        const types = ['uint256'];
        const values = ['1'];

        const result = await blockchainService.contractMethodFeeEstimate(
            randomContract, methodName, types, values, transportConnectionId
        );

        expect(isCustomBn(result)).toBeTruthy();
        expect(result.toString()).toEqual('0');
    });
});
