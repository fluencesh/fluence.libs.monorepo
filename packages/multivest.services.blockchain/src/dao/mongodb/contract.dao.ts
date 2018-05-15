import { MongoDBDao } from '@applicature/multivest.mongodb';
import { Scheme } from '../../types';
import { ContractDao } from '../contract.dao';

export class MongoContractDao extends MongoDBDao<Scheme.ContractScheme> implements ContractDao {
    public getDaoId() {
        return 'contracts';
    }

    public getCollectionName() {
        return 'contracts';
    }

    public getDefaultValue() {
        return {} as Scheme.ContractScheme;
    }

    public async getById(contractId: string): Promise<Scheme.ContractScheme> {
        return this.getRaw({
            id: contractId
        });
    }

    public async getByIdAndProjectId(contractId: string, projectId: string): Promise<Scheme.ContractScheme> {
        return this.getRaw({
            id: contractId,
            projectId
        });
    }

    public async getByAddress(address: string): Promise<Scheme.ContractScheme> {
        return this.getRaw({
            address
        });
    }

    public async getByAddressAndProjectId(address: string, projectId: string): Promise<Scheme.ContractScheme> {
        return this.getRaw({
            address,
            projectId
        });
    }

    public async createContract(
        projectId: string,
        address: string,
        abi: any
    ): Promise<Scheme.ContractScheme> {
        return this.create({
            projectId,
            address,
            abi
        });
    }

    public async setAbi(contractId: string, abi: any) {
        await this.updateRaw(
            { id: contractId },
            {
                $set: {
                    abi
                }
            }
        );

        return;
    }
}
