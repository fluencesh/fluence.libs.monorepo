const { AbstractPlugin } = require('@applicature/multivest.core');

class BitcoinBlockchainPlugin extends AbstractPlugin {
    constructor(pluginManager) {
        super(pluginManager, 'blockchain.bitcoin');
    }

// eslint-disable-next-line class-methods-use-this
    init() {

    }
}

module.exports = BitcoinBlockchainPlugin;
