import { Dao } from '@fluencesh/multivest.core';
import { Scheme } from '../types';

export abstract class ContractDao extends Dao<Scheme.ContractScheme> {
    public abstract async getById(contractId: string): Promise<Scheme.ContractScheme>;
    public abstract async getByIdAndProjectId(contractId: string, projectId: string): Promise<Scheme.ContractScheme>;
    public abstract async getByAddress(address: string): Promise<Scheme.ContractScheme>;
    public abstract async getByAddressAndProjectId(address: string, projectId: string): Promise<Scheme.ContractScheme>;
    public abstract async listByPublicStatus(isPublic: boolean): Promise<Array<Scheme.ContractScheme>>;
    public abstract async listByFabricStatus(isFabric: boolean): Promise<Array<Scheme.ContractScheme>>;
    public abstract async listByIds(ids: Array<string>): Promise<Array<Scheme.ContractScheme>>;
    public abstract async listByAddresses(addresses: Array<string>): Promise<Array<Scheme.ContractScheme>>;

    public abstract async createContract(
        projectId: string,
        address: string,
        abi: any
    ): Promise<Scheme.ContractScheme>;

    public abstract async setAbi(
        contractId: string,
        abi: any
    ): Promise<void>;

    public abstract async markAsPublic(contractId: string): Promise<void>;
    public abstract async markAsFabric(contractId: string): Promise<void>;
}
