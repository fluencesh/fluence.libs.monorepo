import { Scheme } from '@fluencesh/fluence.lib.services';
import { BigNumber } from 'bignumber.js';
import { BiBitcoinTransportService, AvailableNetwork, BitcoinBlock, BitcoinTransaction } from '../../src';
import { checkBlock, checkTx } from '../helpers';

describe('bi bitcoin transport service ', () => {
    let transport: BiBitcoinTransportService;

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
