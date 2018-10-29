import { EthereumBlockchainService } from '../blockchain/ethereum';

// THINK: Is this class still useful?
export class Erc20Contract {
    private ethereumService: EthereumBlockchainService;
    private contract: any;

    constructor(ethereumBlockchainService: EthereumBlockchainService, abi: any, address: string) {
        this.ethereumService = ethereumBlockchainService;
        // FIXME:
        // this.contract = this.ethereumService.getContract(abi, address);
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
