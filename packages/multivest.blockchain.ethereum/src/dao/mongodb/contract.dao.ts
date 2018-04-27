import { MongoDBDao } from '@applicature/multivest.mongodb';
import { ContractScheme } from '../../types';
import { ContractDao } from '../contract.dao';

export class MongoContractDao extends MongoDBDao<ContractScheme> implements ContractDao {
    public getDaoId() {
        return 'contracts';
    }

    public getCollectionName() {
        return 'contracts';
    }

    public getDefaultValue() {
        return {} as ContractScheme;
    }

    public async getById(contractId: string): Promise<ContractScheme> {
        return this.getRaw({
            id: contractId
        });
    }

    public async getByAddress(address: string): Promise<ContractScheme> {
        return this.getRaw({
            address
        });
    }

    public async createContract(
        address: string,
        abi: any
    ): Promise<ContractScheme> {
        return this.create({
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
