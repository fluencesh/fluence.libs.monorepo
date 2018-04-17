import { Dao } from '@applicature/multivest.core';
import { ContractScheme } from '../services/types/types';

export abstract class ContractDao extends Dao<ContractScheme> {
    public abstract async getById(contractId: string): Promise<ContractScheme>;

    public abstract async getByAddress(address: string): Promise<ContractScheme>;

    public abstract async createContract(ethereumAddress: string, status: ContractScheme)
        : Promise<ContractScheme>;

    public abstract async setAbi(
        contractId: string,
        abi: any
    ): Promise<void>;
}
