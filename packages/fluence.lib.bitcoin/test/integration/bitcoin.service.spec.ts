import { Scheme, DaoIds } from '@fluencesh/fluence.lib.services';
import * as config from 'config';
import {
    BitcoinBlockchainService,
    AvailableNetwork,
    BITCOIN,
    ManagedBitcoinTransportService,
    BitcoinTransaction
} from '../../src';
import { checkBlock, checkTx, fnMockOnce } from '../helpers';
import { PluginManager } from '@applicature/synth.plugin-manager';
import { resolve } from 'path';
import BigNumber from 'bignumber.js';

describe('bitcoin service ', () => {
    describe('requests to node', () => {
        let pluginManager: PluginManager;
        let service: BitcoinBlockchainService;

        let transportConnection: Scheme.TransportConnection;

        beforeAll(async () => {
            pluginManager = new PluginManager([
                { path: '@applicature/synth.mongodb' },
                { path: '@fluencesh/fluence.lib.services' },
                { path: resolve(__dirname, '../../src') },
            ]);

            await pluginManager.init();

            const transportConnectionDao = pluginManager.getDao(DaoIds.TransportConnection);

            transportConnection = await transportConnectionDao.create({
                networkId: AvailableNetwork.MAIN_NET,
                blockchainId: BITCOIN,
                status: Scheme.TransportConnectionStatus.Enabled,
                settings: config.get('multivest.blockchain.bitcoin.providers.native')
            });

            const manager = new ManagedBitcoinTransportService(pluginManager, AvailableNetwork.MAIN_NET);
            await manager.init();

            service = new BitcoinBlockchainService(pluginManager, manager);
        });

        afterAll(async () => {
            await (pluginManager as any).plugins.mongodb.db.dropDatabase();
            await (pluginManager as any).plugins.mongodb.connection.close();
        })

        it('should get block by hash', async () => {
            const hash = '0x000000000091ccd98b544b611b8b72603da95a11ad3fca14488fde5d54990ec9';
    
            const block = await service.getBlockByHash(hash, transportConnection.id);
    
            checkBlock(block);
        });
    
        it('should get block by height', async () => {
            const height = 1297911;
    
            const block = await service.getBlockByHeight(height, transportConnection.id);
    
            checkBlock(block);
        });
    
        it('should get count of blocks', async () => {
            const height = await service.getBlockHeight(transportConnection.id);
    
            expect(typeof height === 'number').toBeTruthy();
        });
    
        it('should get tx by hash', async () => {
            const hash = '0xbd9094c980164e9a99943bc948fd56b0521911866816c53567c48716cad8d49b';
    
            const tx = await service.getTransactionByHash(hash, transportConnection.id);
    
            checkTx(tx);
        });
    });

    describe('lib functions', () => {
        let service: BitcoinBlockchainService;
        let serviceTestNet: BitcoinBlockchainService;

        beforeAll(() => {
            service = new BitcoinBlockchainService(
                { getServiceByClass: (): null => null } as any,
                { getNetworkId: () => AvailableNetwork.MAIN_NET } as any,
            );

            serviceTestNet = new BitcoinBlockchainService(
                { getServiceByClass: (): null => null } as any,
                { getNetworkId: () => AvailableNetwork.TEST_NET } as any,
            );
        });

        it('should return address of hd node (bitcoin main net)', async () => {
            fnMockOnce(config, 'has', () => true);
            fnMockOnce(config, 'get', () => 'xpub6Djn1Ppqg8CV3fshmia6aBbUbdeogruYcg6LMNgftnB1eCeF1bwTPuPNSqFXFw5or8XC297aekyFVM9amYnuEuKWp2niwLvLdRdbxECenqY');
            const address = await service.getHDAddress(0);

            expect(address).toEqual('0x1347PoGgL51svjLqY6kMVfje1KSpRQY6wu');
        });

        it('should return address of hd node (bitcoin test net)', async () => {
            fnMockOnce(config, 'has', () => true);
            fnMockOnce(config, 'get', () => 'tpubDE7QXdeXPQ9wKU4ZDuZBn6vqvkkTgFQcAJgdhvjpEgvuPVJx5pnYYM4CgsLJnS33e346didTBroJBXeCAQe98LmosdY2csaaDPE1iFTH5qY');
            const address = await serviceTestNet.getHDAddress(0);

            expect(address).toEqual('0xmha4grMf96T8hqpTFfijKawxsK3XQ8osvj');
        });

        it('should check if address is valid', async () => {
            const isValid = await service.isValidAddress('0xmpY5iamBPponD6FmqRunGmU3NvnKDnMbTD');

            expect(isValid).toBeTruthy();
        });

        it('should sign tx', async () => {
            const pk = 'KxDQjJwvLdNNGhsipGgmceWaPjRndZuaQB9B2tgdHsw5sQ8Rtqje';
            const tx = {
                hash: '0xd9dc0499be7dfd9df410c76e736ec5db908e99d394475f08a2c3eb10be90093a',
                to: [{
                    address: '0x15WeEKudBeSXdyU38M9vAAxsmE7rnUeWYC',
                    amount: new BigNumber(1)
                }],
            } as BitcoinTransaction;

            const hex = await service.signTransaction(Buffer.from(pk, 'utf8'), tx);
            expect(typeof hex).toEqual('string');
        });

        it('should sign data', async () => {
            const pk = 'KxDQjJwvLdNNGhsipGgmceWaPjRndZuaQB9B2tgdHsw5sQ8Rtqje';
            const signature = await service.signData(
                Buffer.from(pk, 'utf8'),
                Buffer.from('9a2bcf9ca5d57364a75da12831635969')
            );

            expect(signature.r).toBeInstanceOf(Buffer);
            expect(signature.s).toBeInstanceOf(Buffer);
        });


        it('should sign data and stringify', async () => {
            const pk = 'KxDQjJwvLdNNGhsipGgmceWaPjRndZuaQB9B2tgdHsw5sQ8Rtqje';
            const hex = await service.signDataAndStringify(
                Buffer.from(pk, 'utf8'),
                Buffer.from('9a2bcf9ca5d57364a75da12831635969')
            );

            expect(typeof hex).toEqual('string');
        });
    })
});
