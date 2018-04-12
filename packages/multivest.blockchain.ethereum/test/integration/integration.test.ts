import { EthereumBlockchainService } from '../../src/services/blockchain/ethereum';
import { Contract } from '../../src/services/contracts/contract';

import { BigNumber } from 'bignumber.js';

describe('service', () => {
    it('should sign', async () => {
        const service = new EthereumBlockchainService(null, null);
        const signed = await service.sign('0xab096838b9c8af3a35e384d426bba055f93e1f83', 'fjls');
        expect(signed.length).toBe(132);
    });

    it('should send transaction', async () => {
        const service = new EthereumBlockchainService();
        const transaction = {
            from: [
                {
                    address: '0xB127641b794D97788B3e6995a55d9f348E4b4999',
                },
            ],
            to: [
                {
                    address: '0x3661ADC89317b732266A04c74F0E0dd5E9b28691',
                    amount: new BigNumber(0),
                },
            ],
            gas: 4000000,
            gasPrice: 1000000000,
            nonce: 2,
            input:
                // tslint:disable-next-line:max-line-length
                '0xa8c220270000000000000000000000003661adc89317b732266a04c74f0e0dd5e9b28691000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000003e8000000000000000000000000000000000000000000000000000000000000001c81e05b6d69488f0ee183fa777cc11e98559e3b02082128df61431134367b97d807f33d5e368612e71a5bc8135ddbd8af9a188219014e238c18c28df3c19f50eb',
        };
        const txHash = await service.sendTransaction(transaction);
        expect(txHash).toBeTruthy();
    });
});

describe('contract', () => {
    it('should work', async () => {
        return;
    });
});
