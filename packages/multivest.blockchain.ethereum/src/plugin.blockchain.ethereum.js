const { AbstractPlugin } = require('@applicature/multivest.core');

class EthereumBlockchainPlugin extends AbstractPlugin {
    constructor(pluginManager) {
        super(pluginManager, 'blockchain.ethereum');
    }

// eslint-disable-next-line class-methods-use-this
    init() {

    }
}

module.exports = EthereumBlockchainPlugin;
