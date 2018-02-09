import { EthereumBlockchainService } from '../../src/services/blockchain/ethereum';
import { Contract } from '../../src/services/contracts/contract';

describe('service', () => {
    it('should sign', async () => {
        const service = new EthereumBlockchainService(false);
        const signed = await service.sign(
            '0xab096838b9c8af3a35e384d426bba055f93e1f83',
            'fjls'
        );
        expect(signed.length).toBe(132);
    });
});

describe('contract', () => {
    it('should work', async () => {
        return;
    });
});
