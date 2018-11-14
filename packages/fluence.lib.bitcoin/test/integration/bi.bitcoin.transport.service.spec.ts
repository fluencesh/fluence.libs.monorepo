import { Scheme } from '@applicature-private/fluence.lib.services';
import { BigNumber } from 'bignumber.js';
import { BiBitcoinTransportService, AvailableNetwork, BitcoinBlock, BitcoinTransaction } from '../../src';

describe('bi bitcoin transport service ', () => {
    let transport: BiBitcoinTransportService;

    function checkBlock(block: BitcoinBlock) {
        expect(block.fee).toBeInstanceOf(BigNumber);
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

    function checkTx(tx: BitcoinTransaction) {
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
            settings: {
                apiKey: '',
                url: 'https://blockchain.info/',
                wallet: {
                    id: '06ffb1db-ceb6-4d87-bfa2-278f7ea11d4d'
                },
            }
        } as Scheme.TransportConnection;

        transport = new BiBitcoinTransportService(null, connection);
    });

    it('should get block by hash', async () => {
        const hash = '0x000000000000000000058e4ee44cd26e9e40c3a57ab480cefe433d6ee28ac228';

        const block = await transport.getBlockByHash(hash);

        checkBlock(block);
    });

    it('should get block by height', async () => {
        const height = 522607;

        const block = await transport.getBlockByHeight(height);

        checkBlock(block);
    });

    it('should get count of blocks', async () => {
        const height = await transport.getBlockHeight();

        expect(typeof height === 'number').toBeTruthy();
    });

    it('should get tx by hash', async () => {
        const hash = '0x77b837ac4ad1d6d75571a4495fe16de970bfa46804e8a8ab6402613c51dd1cf4';

        const tx = await transport.getTransactionByHash(hash);

        checkTx(tx);
    });

    it('should get balance by address', async () => {
        const address = '0x34ktxDJFhTZLMPjMnUhReowniw57H4tdqX';

        const balance = await transport.getBalance(address);

        expect(balance).toBeInstanceOf(BigNumber);
    });
});
