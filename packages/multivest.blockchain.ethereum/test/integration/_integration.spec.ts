import {
    MongodbTransportConnectionDao,
    Scheme,
    TransportConnectionService,
} from '@applicature-restricted/multivest.services.blockchain';
import * as cfg from 'config';
import { resolve } from 'path';
import { EthereumBlockchainService } from '../../src/services/blockchain/ethereum';
import { Contract } from '../../src/services/contracts/contract';

import { BigNumber } from 'bignumber.js';
import { Db, MongoClient } from 'mongodb';
import { Transaction } from '../../../multivest.services.blockchain/node_modules/@applicature/multivest.core';

describe('service', () => {
    let service: EthereumBlockchainService;

    beforeAll(async () => {
        service = new EthereumBlockchainService(
            null,
            'rinkeby',
            [
                { providerId: 'infura' } as Scheme.TransportConnection
            ]
        );
    });

    it('should sign', async () => {
        const signed = await service.signData(
            Buffer.from('0xab096838b9c8af3a35e384d426bba055f93e1f83'),
            Buffer.from('fjls')
        );

        expect(signed).toBeTruthy();
    });

    it('should send transaction', async () => {
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
            fee: new BigNumber(20)
        } as Transaction;

        const txHash = await service.sendTransaction(
            Buffer.from('0xab096838b9c8af3a35e384d426bba055f93e1f83'),
            transaction
        );

        expect(txHash).toBeTruthy();
    });
});

describe('contract', () => {
    it('should work', async () => {
        return;
    });
});
