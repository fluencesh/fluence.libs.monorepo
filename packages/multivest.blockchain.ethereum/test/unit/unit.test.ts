
import { EthereumBlockchainService } from '../../src/services/blockchain/ethereum';
import { Contract } from '../../src/services/contracts/contract';

describe('contract', () => {
    it('should work', () => {
        const service = new EthereumBlockchainService(false);
        const contract = service.getContract([], '');
    });
});