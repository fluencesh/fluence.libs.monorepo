import { EthereumBlockchainService } from '../blockchain/ethereum';
// tslint:disable-next-line:no-var-requires
const abi = require(__dirname + '/../../abi/erc20.json');

export class Erc20Contract {
    private ethereumService: EthereumBlockchainService;
    private contract: any;

    constructor(address: string) {
        this.ethereumService = new EthereumBlockchainService();
        this.contract = this.ethereumService.getContract(abi, address);
    }

    public async getDecimals() {
        const result = await this.contract.decimals.call();
        return result.valueOf();
    }

    public async getBalance(address: string) {
        const result = await this.contract.balanceOf.call(address);

        return result.valueOf();
    }

    public async getTotalSupply() {
        const result = await this.contract.totalSupply.call();

        return result.valueOf();
    }
}