import { Plugin } from '../../src/plugin.blockchain.litecoin';
import {LitecoinBlockchainService} from '../../src/services/litecoin';

describe('plugin.blockchain.litecoin', () => {
    it('should work', () => {
        const service = new LitecoinBlockchainService();

        expect(service.getHDAddress(0)).toEqual('LXJsK34F4yRrM1Pj7Lg66nPqRQwQF1ZPLg');
        expect(service.getHDAddress(2)).toEqual('LL6e2sYtURWiGcf9xto3VdqWnGhNE2swxi');
        expect(service.getHDAddress(18)).toEqual('Li6GK5LhEsSi4zGqfZFwRCgWuy35gAMgct');

        return;
    });
});
