import { PluginManager, Service } from '@applicature/multivest.core';
import { Plugin } from '@applicature/multivest.mongodb';
import { ContractDao } from '../../dao/contract.dao';
import { ContractScheme } from '../../types';

export class ContractService extends Service {
    protected contractDao: ContractDao;

    public async init(): Promise<void> {
        const mongodbPlugin = this.pluginManager.get('mongodb');

        // tslint:disable-next-line:no-string-literal
        this.contractDao = (await mongodbPlugin.getDaos())['contracts'] as ContractDao;
    }

    public getServiceId() {
        return 'object.contracts';
    }

    public getById(contractId: string): Promise<ContractScheme> {
        return this.contractDao.getById(contractId);
    }

    public getByAddress(address: string): Promise<ContractScheme> {
        return this.contractDao.getByAddress(address);
    }

    public createContract(
        address: string,
        abi: any
    ): Promise<ContractScheme> {
        return this.contractDao.createContract(address, abi);
    }

    public setAbi(contractId: string, abi: any): Promise<void> {
        return this.contractDao.setAbi(contractId, abi);
    }
}
