import { Scheme, DaoIds } from '@fluencesh/fluence.lib.services';
import * as config from 'config';
import {
    AvailableNetwork,
    LitecoinBlockchainService,
    ManagedLitecoinTransportService,
    LITECOIN,
    LitecoinTransaction,
} from '../../src';
import { Db, MongoClient } from 'mongodb';
import { checkBlock, checkTx, fnMockOnce } from '../helpers';
import { PluginManager } from '@applicature/synth.plugin-manager';
import { resolve } from 'path';
import BigNumber from 'bignumber.js';

describe('litecoin service ', () => {
    describe('requests to node', () => {
        let service: LitecoinBlockchainService;

        let transportConnection: Scheme.TransportConnection;

        beforeAll(async () => {
            const pluginManager = new PluginManager([
                { path: '@applicature/synth.mongodb' },
                { path: '@fluencesh/fluence.lib.services' },
                { path: resolve(__dirname, '../../src') },
            ]);

            await pluginManager.init();

            const transportConnectionDao = pluginManager.getDao(DaoIds.TransportConnection);

            transportConnection = await transportConnectionDao.create({
                networkId: AvailableNetwork.LITECOIN,
                blockchainId: LITECOIN,
                status: Scheme.TransportConnectionStatus.Enabled,
                settings: config.get('multivest.blockchain.litecoin.providers.native')
            });

            const manager = new ManagedLitecoinTransportService(pluginManager, AvailableNetwork.LITECOIN);
            await manager.init();

            service = new LitecoinBlockchainService(pluginManager, manager);
        });

        it('should get block by hash', async () => {
            const hash = '0xac05c6760737937fdd82b72bdec17edc1260ba604db1efaf1382ea8e14f2e238';
    
            const block = await service.getBlockByHash(hash, transportConnection.id);
    
            checkBlock(block);
        });
    
        it('should get block by height', async () => {
            const height = 579145;
    
            const block = await service.getBlockByHeight(height, transportConnection.id);
    
            checkBlock(block);
        });
    
        it('should get count of blocks', async () => {
            const height = await service.getBlockHeight(transportConnection.id);
    
            expect(typeof height === 'number').toBeTruthy();
        });
    
        it('should get tx by hash', async () => {
            const hash = '0xcba0c03e62a15d1214c9d2ca5cca1d2bf4cb7735fa9755979824d1c748e3a294';
    
            const tx = await service.getTransactionByHash(hash, transportConnection.id);
    
            checkTx(tx);
        });
    
        it('should get balance by address', async () => {
            const address = '0xLi4QamDbtR4mPY5HPEjNtXshpCaCKqDNpm';
    
            const balance = await service.getBalance(address, 0, transportConnection.id);
    
            expect(balance.constructor.name).toEqual('BigNumber');
        });
    });

    describe('lib functions', () => {
        let service: LitecoinBlockchainService;
        let serviceTestNet: LitecoinBlockchainService;

        beforeAll(() => {
            service = new LitecoinBlockchainService(
                { getServiceByClass: (): null => null } as any,
                { getNetworkId: () => AvailableNetwork.LITECOIN } as any
            );

            serviceTestNet = new LitecoinBlockchainService(
                { getServiceByClass: (): null => null } as any,
                { getNetworkId: () => AvailableNetwork.LITECOIN_TESTNET } as any
            );
        });

        it('should return address of hd node (litecoin main net)', async () => {
            fnMockOnce(config, 'has', () => true);
            // tslint:disable-next-line:max-line-length
            fnMockOnce(config, 'get', () => 'Ltub2WiGcLmFFSKkH61Dx8S5GhQB77hiL8hZpjRozT6uJzjLiJfFsYvW4mtBBoTVv1jFq6XsKCXyti6pThqWzaGHJupvvG8L29XHXhy3cNjiHf1');
            const address = await service.getHDAddress(0);

            expect(address).toEqual('0xLUF5gjz2fTcagnUKHzvhisKUj9YtPeLuAY');
        });

        it('should return address of hd node (litecoin test net)', async () => {
            fnMockOnce(config, 'has', () => true);
            // tslint:disable-next-line:max-line-length
            fnMockOnce(config, 'get', () => 'ttub4f6eUTzr3NkUpYL6G3cV4b2RAQxEpdgaqUJBjxRSYYpU86QjfpCrUscr9SXBMFqc4MgRz1fvqChyfHBtR6dVWzmUM5SkHzwo8GZazrojBWu');
            const address = await serviceTestNet.getHDAddress(0);

            expect(address).toEqual('0xmha4grMf96T8hqpTFfijKawxsK3XQ8osvj');
        });

        it('should check if address is valid', async () => {
            const isValid = await service.isValidAddress('0xmha4grMf96T8hqpTFfijKawxsK3XQ8osvj');

            expect(isValid).toBeTruthy();
        });

        it('should sign tx', async () => {
            const pk = 'T52BzRwxuPQWu3SZMJ5jKy8b4h9bBomTwmYbzWCReGFpUNb4cDzs';
            const tx = {
                hash: '0x7d076caa07634ef458cbab006ce3fa099a2bcf9ca5d57364a75da12831635969',
                to: [{
                    address: '0xLdeesjYtQbBxsXjr3QngUFzDUpjz4QnTcR',
                    amount: new BigNumber(1)
                }],
            } as LitecoinTransaction;

            const hex = await service.signTransaction(Buffer.from(pk, 'utf8'), tx);
            expect(typeof hex).toEqual('string');
        });

        it('should sign data', async () => {
            const pk = 'T52BzRwxuPQWu3SZMJ5jKy8b4h9bBomTwmYbzWCReGFpUNb4cDzs';
            const signature = await service.signData(
                Buffer.from(pk, 'utf8'),
                Buffer.from('9a2bcf9ca5d57364a75da12831635969')
            );

            expect(signature.r).toBeInstanceOf(Buffer);
            expect(signature.s).toBeInstanceOf(Buffer);
        });

        it('should sign data and stringify', async () => {
            const pk = 'T52BzRwxuPQWu3SZMJ5jKy8b4h9bBomTwmYbzWCReGFpUNb4cDzs';
            const hex = await service.signDataAndStringify(
                Buffer.from(pk, 'utf8'),
                Buffer.from('9a2bcf9ca5d57364a75da12831635969')
            );

            expect(typeof hex).toEqual('string');
        });
    });
});
