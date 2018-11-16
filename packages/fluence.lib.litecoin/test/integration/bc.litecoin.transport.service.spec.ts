import { Scheme } from '@applicature-private/fluence.lib.services';
import { BigNumber } from 'bignumber.js';
import * as config from 'config';
import {
    BcLitecoinTransportService,
    AvailableNetwork,
    LitecoinBlock,
    LitecoinTransaction
} from '../../src';

describe('bc litecoin transport service ', () => {
    let transport: BcLitecoinTransportService;

    function checkBlock(block: LitecoinBlock) {
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

    function checkTx(tx: LitecoinTransaction) {
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
});
