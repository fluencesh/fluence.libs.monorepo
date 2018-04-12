import { EthereumBlockchainService } from '../../src/services/blockchain/ethereum';
import { Contract } from '../../src/services/contracts/contract';

import * as Web3 from 'web3';
import { EthersEthereumTransportService } from '../..';

describe('contract', () => {
    it('should work', async () => {
        const service = new EthereumBlockchainService(
            'homestead',
            new EthersEthereumTransportService(
                0, 'homestead', 'http://localhost:8545'
            )
        );
        const contract = await service.getBlockHeight();
    });

    it('signing', async () => {
        const abi = require('../../src/abi/erc20.json');

        const contract = new Contract(
            abi,
            '0xfa2f05e24975f81fd778771be9d8fcf81f0be98a'
            // '0xeff415edb6331f4f67bdb7f1ecc639da9bcc0550b100bb275c7b5b21ce3a7804'
        );

        const data = await (contract as any).generateData(
            'transfer',
            ['address', 'uint256'],
            ['0xfa2f05e24975f81fd778771be9d8fcf81f0be98a', 1000]
        );

        expect(data).toBeTruthy();
    });
});
