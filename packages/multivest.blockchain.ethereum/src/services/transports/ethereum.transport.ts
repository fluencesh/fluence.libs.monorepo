import {ETHEREUM, EthereumTransaction, EthereumTransactionReceipt} from "../types/types";
import { BlockchainTransportService } from "@applicature-restricted/multivest.blockchain";

export abstract class EthereumTransportService extends BlockchainTransportService {
    public getBlockchainId() {
        return ETHEREUM;
    }

    public abstract async call(transaction: EthereumTransaction): Promise<string>;
    public abstract async estimateGas(transaction: EthereumTransaction): Promise<number>;
    public abstract async getGasPrice(): Promise<number>;
    public abstract async getCode(address: string): Promise<string>;
    public abstract async getTransactionReceipt(txHex: string): Promise<EthereumTransactionReceipt>;
}
