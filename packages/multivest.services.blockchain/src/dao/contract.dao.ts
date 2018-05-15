import { Dao } from '@applicature/multivest.core';
import { Scheme } from '../types';

export abstract class ContractDao extends Dao<Scheme.ContractScheme> {
    public abstract async getById(contractId: string): Promise<Scheme.ContractScheme>;
    public abstract async getByIdAndProjectId(contractId: string, projectId: string): Promise<Scheme.ContractScheme>;
    public abstract async getByAddress(address: string): Promise<Scheme.ContractScheme>;
    public abstract async getByAddressAndProjectId(address: string, projectId: string): Promise<Scheme.ContractScheme>;

    public abstract async createContract(
        projectId: string,
        address: string,
        abi: any
    ): Promise<Scheme.ContractScheme>;

    public abstract async setAbi(
        contractId: string,
        abi: any
    ): Promise<void>;
}
