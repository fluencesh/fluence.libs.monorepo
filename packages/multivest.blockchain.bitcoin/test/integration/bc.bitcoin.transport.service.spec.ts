import { Scheme } from '@applicature-restricted/multivest.services.blockchain';
import { Block, Transaction } from '@applicature/multivest.core';
import { BigNumber } from 'bignumber.js';
import * as config from 'config';
import { BcBitcoinTransportService } from '../../src/services/transports/bc.bitcoin.transport';
import { AvailableNetwork } from '../../src/types';

describe('bc bitcoin transport service ', () => {
    let transport: BcBitcoinTransportService;

    function checkBlock(block: Block) {
        expect(typeof block.hash === 'string').toBeTruthy();
        expect(typeof block.height === 'number').toBeTruthy();
        expect(typeof block.network === 'string').toBeTruthy();
        expect(typeof block.nonce === 'number').toBeTruthy();
        expect(typeof block.parentHash === 'string').toBeTruthy();
        expect(typeof block.size === 'number').toBeTruthy();
        expect(typeof block.time === 'number').toBeTruthy();

        expect(block.transactions).toBeInstanceOf(Array);
        block.transactions.forEach((tx) => {
            checkTx(tx);
        });
    }

    function checkTx(tx: Transaction) {
        if (tx.hasOwnProperty('blockHash')) {
            expect(typeof tx.blockHash === 'string').toBeTruthy();
        }
        if (tx.hasOwnProperty('blockHeight')) {
            expect(typeof tx.blockHeight === 'number').toBeTruthy();
        }
        if (tx.hasOwnProperty('blockTime')) {
            expect(typeof tx.blockTime === 'number').toBeTruthy();
        }

        expect(typeof tx.hash === 'string').toBeTruthy();

        expect(tx.from).toBeInstanceOf(Array);
        tx.from.forEach((sender) => {
            if (sender.address) {
                expect(typeof sender.address === 'string');
            }
        });

        expect(tx.to).toBeInstanceOf(Array);
        tx.to.forEach((recipient) => {
            expect(typeof recipient.address === 'string');
            expect(recipient.amount).toBeInstanceOf(BigNumber);
        });
    }

    beforeAll(async () => {
        const connection = {
            networkId: AvailableNetwork.MAIN_NET,
            settings: config.get('multivest.blockchain.bitcoin.providers.native')
        } as Scheme.TransportConnection;

        transport = new BcBitcoinTransportService(null, connection);
    });

    it('should get block by hash', async () => {
        const hash = '0x000000000091ccd98b544b611b8b72603da95a11ad3fca14488fde5d54990ec9';

        const block = await transport.getBlockByHash(hash);

        checkBlock(block);
    });

    it('should get block by height', async () => {
        const height = 1297911;

        const block = await transport.getBlockByHeight(height);

        checkBlock(block);
    });

    it('should get count of blocks', async () => {
        const height = await transport.getBlockHeight();

        expect(typeof height === 'number').toBeTruthy();
    });

    it('should get tx by hash', async () => {
        const hash = '0x3d8098f7c22eab54e3ca338dca6cbff8624ad73e2c8d9ad0efa287412cd70d65';

        const tx = await transport.getTransactionByHash(hash);

        checkTx(tx);
    });

    it.skip('should get balance by address', async () => {
        const address = '0xmgadYuDvGwULgroRp2ZfM5CnH89HsAWv9t';

        const balance = await transport.getBalance(address);

        expect(balance).toBeInstanceOf(BigNumber);
    });

    it('should check is address valid', async () => {
        const address = '0xmgadYuDvGwULgroRp2ZfM5CnH89HsAWv9t';

        const valid = transport.isValidAddress(address);

        expect(typeof valid === 'boolean').toBeTruthy();
    });
});
