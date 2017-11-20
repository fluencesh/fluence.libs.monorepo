const EthereumService = require('../blockchain/ethereum');

const abi = require('../../abi/erc20.json');

class Erc20Contract {
    constructor(address) {
        this.ethereumService = new EthereumService();

        this.contract = this.ethereumService.getContract(abi, address);
    }

    async getDecimals() {
        const result = await this.contract.methods.decimals().call();

        return result.valueOf();
    }

    async getBalance(address) {
        const result = await this.contract.methods.balanceOf(address).call();

        return result.valueOf();
    }

    async getTotalSupply() {
        const result = await this.contract.methods.totalSupply().call();

        return result.valueOf();
    }
}

module.exports = Erc20Contract;
