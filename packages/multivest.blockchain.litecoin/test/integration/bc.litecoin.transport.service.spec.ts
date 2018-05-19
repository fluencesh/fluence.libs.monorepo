import { Scheme } from '@applicature-restricted/multivest.services.blockchain';
import { Block, Transaction } from '@applicature/multivest.core';
import BigNumber from 'bignumber.js';
import * as config from 'config';
import { AvailableNetwork } from '../../src/constants';
import { BcLitecoinTransportService } from '../../src/services/transports/bc.litecoin.transport.service';

describe('bc bitcoin transport service ', () => {
    let transport: BcLitecoinTransportService;

    function checkBlock(block: Block) {
        expect(typeof block.hash).toEqual('string');
        expect(typeof block.height).toEqual('number');
        expect(typeof block.network).toEqual('string');
        expect(typeof block.nonce).toEqual('number');
        expect(typeof block.parentHash).toEqual('string');
        expect(typeof block.size).toEqual('number');
        expect(typeof block.time).toEqual('number');

        expect(block.transactions).toBeInstanceOf(Array);
        block.transactions.forEach((tx) => {
            checkTx(tx);
        });
    }

    function checkTx(tx: Transaction) {
        if (tx.hasOwnProperty('blockHash')) {
            expect(typeof tx.blockHash).toEqual('string');
        }
        if (tx.hasOwnProperty('blockHeight')) {
            expect(typeof tx.blockHeight).toEqual('number');
        }
        if (tx.hasOwnProperty('blockTime')) {
            expect(typeof tx.blockTime).toEqual('number');
        }

        expect(typeof tx.hash).toEqual('string');

        expect(tx.from).toBeInstanceOf(Array);
        tx.from.forEach((sender) => {
            if (sender.address) {
                expect(typeof sender.address).toEqual('string');
            }
        });

        expect(tx.to).toBeInstanceOf(Array);
        tx.to.forEach((recipient) => {
            expect(typeof recipient.address).toEqual('string');
            expect(recipient.amount.constructor.name).toEqual('BigNumber');
        });
    }

    beforeAll(async () => {

        const connection = {
            networkId: AvailableNetwork.TEST_NET,
            settings: config.get('multivest.blockchain.litecoin.providers.native')
        } as Scheme.TransportConnection;

        transport = new BcLitecoinTransportService(null, connection);
    });

    it('should get block by hash', async () => {
        const hash = '0xac05c6760737937fdd82b72bdec17edc1260ba604db1efaf1382ea8e14f2e238';

        const block = await transport.getBlockByHash(hash);

        checkBlock(block);
    });

    it('should get block by height', async () => {
        const height = 579145;

        const block = await transport.getBlockByHeight(height);

        checkBlock(block);
    });

    it('should get count of blocks', async () => {
        const height = await transport.getBlockHeight();

        expect(typeof height === 'number').toBeTruthy();
    });

    it('should get tx by hash', async () => {
        const hash = '0xcba0c03e62a15d1214c9d2ca5cca1d2bf4cb7735fa9755979824d1c748e3a294';

        const tx = await transport.getTransactionByHash(hash);

        checkTx(tx);
    });

    it('should get balance by address', async () => {
        const address = '0xLi4QamDbtR4mPY5HPEjNtXshpCaCKqDNpm';

        const balance = await transport.getBalance(address);

        expect(balance.constructor.name).toEqual('BigNumber');
    });

    it('should check is address valid', async () => {
        const address = '0xLLgJTbzZMsRTCUF1NtvvL9SR1a4pVieW89';

        const valid = transport.isValidAddress(address);

        expect(typeof valid === 'boolean').toBeTruthy();
    });
});
