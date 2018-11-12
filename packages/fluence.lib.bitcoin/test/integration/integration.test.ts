import { BitcoinBlockchainService } from '../../src/services/blockchain/bitcoin';

// TODO: write test for all methods of BitcoinBlockchainService (except those which needed ethers)
describe('test', () => {
    let service: BitcoinBlockchainService;

    beforeEach(() => {
        service = new BitcoinBlockchainService(false);
    });

    it('should get block by height', async () => {
        const block = await service.getBlockByHeight(1287103);

        expect(typeof block.difficulty).toEqual('number');
        expect(typeof block.hash).toEqual('string');
        expect(block.height).toEqual(1287103);
        expect(block.network).toEqual('testnet');
        expect(typeof block.parentHash).toEqual('string');
        expect(typeof block.time).toEqual('number');
    });
});
