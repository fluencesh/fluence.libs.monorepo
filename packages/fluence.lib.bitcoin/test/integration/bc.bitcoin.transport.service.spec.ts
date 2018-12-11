import { Scheme } from '@fluencesh/fluence.lib.services';
import { BigNumber } from 'bignumber.js';
import * as config from 'config';
import {
    BcBitcoinTransportService,
    AvailableNetwork,
} from '../../src';
import { checkBlock, checkTx } from '../helpers';

describe('bc bitcoin transport service ', () => {
    let transport: BcBitcoinTransportService;

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
        const hash = '0xbd9094c980164e9a99943bc948fd56b0521911866816c53567c48716cad8d49b';

        const tx = await transport.getTransactionByHash(hash);

        checkTx(tx);
    });

    // TODO:
    // Error:
    // code: -32601
    // message: "Method not found"
    // name: "RpcError"
    // status:-32601
    // https://applicature.atlassian.net/browse/FLC-216
    it.skip('should get balance by address', async () => {
        const address = '0xmgadYuDvGwULgroRp2ZfM5CnH89HsAWv9t';

        const balance = await transport.getBalance(address);

        expect(balance).toBeInstanceOf(BigNumber);
    });
});
