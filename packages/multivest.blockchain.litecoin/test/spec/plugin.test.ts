import { Plugin } from '../../src/plugin.blockchain.litecoin';
import { LitecoinBlockchainService } from '../../src/services/litecoin';

describe('plugin.blockchain.litecoin', () => {
    it('should work with ttub key', () => {
        const service = new LitecoinBlockchainService(
            true,
            'litecoin_testnet',
            // tslint:disable-next-line:max-line-length
            'ttub4be2cmjDjFZjobBfqyUTuEitb6gai7xTvFRgYx6ZbGY6TpnwskhAL6dDXYD8Lw5oT7HXgwhnE8CAXYWhjE1Rk5VUAAtti7nhY48gkSkk2xu'
        );

        expect(service.getHDAddress(0)).toEqual('mpY5iamBPponD6FmqRunGmU3NvnKDnMbTD');
        expect(service.getHDAddress(2)).toEqual('mqPrXw44ys2WXGbPr7hxrkLKXg3eH8uAce');
        expect(service.getHDAddress(18)).toEqual('muBLFuVCwQ6nQCAgJizrebuK7JQ8YFHua2');

        return;
    });

    it('should work with Ltub key', () => {
        const service = new LitecoinBlockchainService(
            true,
            'litecoin',
            // tslint:disable-next-line:max-line-length
            'Ltub2ZBUenrsjcXfmAULHJYkNribjxAKbGSM4deb7S6fQmnhPeiKrbEM1J47SHF7arQMTtrJtY4EQ2dCQLmBYCKpUj9ZQtNTZH9SN3RNA3QCVhS'
        );

        expect(service.getHDAddress(0)).toEqual('LRkLYKmCfDrXts5i3YhNpTxgFtYjidzZbG');
        expect(service.getHDAddress(2)).toEqual('LgYSpUAT8ijraLTtroWYCHnGLYdcFFjtKp');
        expect(service.getHDAddress(18)).toEqual('LSgbnFDe3XBMkrTaxTky26peqNC2AeiWSN');

        return;
    });
});
