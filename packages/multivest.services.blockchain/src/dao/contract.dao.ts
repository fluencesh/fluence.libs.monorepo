import { Dao } from '@applicature/multivest.core';
import { Scheme } from '../types';

export abstract class ContractDao extends Dao<Scheme.ContractScheme> {
    public abstract async getById(contractId: string): Promise<Scheme.ContractScheme>;

    public abstract async getByAddress(address: string): Promise<Scheme.ContractScheme>;

    public abstract async createContract(ethereumAddress: string, status: Scheme.ContractScheme)
        : Promise<Scheme.ContractScheme>;

    public abstract async setAbi(
        contractId: string,
        abi: any
    ): Promise<void>;
}
