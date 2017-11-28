const config = require('config');
const bitecoin = require('bitcoinjs-lib');
const Client = require('bitcoin-core');

const LitecoinConstant = require('../constants/litecoin.constant');

const { BitcoinService } = require('@applicature/multivest.blockchain.bitcoin');

class LitecoinService extends BitcoinService {
    constructor(fake) {
        super();

        if (!!fake === false) {
            this.client = new Client(config.get('multivest.blockchain.litecoin.providers.native'));
        }

        this.network = bitecoin.networks.litecoin;
        this.masterPublicKey = config.get('multivest.blockchain.litecoin.hd.masterPublicKey');
    }

// eslint-disable-next-line class-methods-use-this
    getNetworkId() {
        return LitecoinConstant.LITECOIN;
    }

// eslint-disable-next-line class-methods-use-this
    getSymbol() {
        return 'LTC';
    }
}

module.exports = LitecoinService;
