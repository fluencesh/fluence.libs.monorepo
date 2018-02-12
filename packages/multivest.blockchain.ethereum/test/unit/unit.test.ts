import { EthereumBlockchainService } from '../../src/services/blockchain/ethereum';
import { Contract } from '../../src/services/contracts/contract';

import * as Web3 from 'web3';

describe('contract', () => {
    it('should work', () => {
        const service = new EthereumBlockchainService(null, false, false);
        const contract = service.getContract([], '');
    });

    it('signing', async () => {
        const abi = require('../../src/abi/erc20.json');

        const contract = new Contract(
            abi,
            '0xfa2f05e24975f81fd778771be9d8fcf81f0be98a',
            '0xeff415edb6331f4f67bdb7f1ecc639da9bcc0550b100bb275c7b5b21ce3a7804'
        );

        const data = await contract.generateData(
            'transfer',
            ['address', 'uint256'],
            ['0xfa2f05e24975f81fd778771be9d8fcf81f0be98a', 1000]
        );

        expect(data).toBeTruthy();
    });
});
