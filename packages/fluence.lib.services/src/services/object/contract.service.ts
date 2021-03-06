import { Plugin } from '@applicature/synth.mongodb';
import { PluginManager, Service } from '@applicature/synth.plugin-manager';
import { DaoIds } from '../../constants';
import { ContractDao } from '../../dao/contract.dao';
import { Scheme } from '../../types';

export class ContractService extends Service {
    protected contractDao: ContractDao;

    public async init(): Promise<void> {
        const mongodbPlugin = this.pluginManager.get('mongodb') as any as Plugin;

        this.contractDao =
            await mongodbPlugin.getDao(DaoIds.Contract) as ContractDao;
    }

    public getServiceId() {
        return 'object.contracts';
    }

    public getById(contractId: string): Promise<Scheme.ContractScheme> {
        return this.contractDao.getById(contractId);
    }

    public getByIdAndProjectId(contractId: string, projectId: string): Promise<Scheme.ContractScheme> {
        return this.contractDao.getByIdAndProjectId(contractId, projectId);
    }

    public getByAddress(address: string): Promise<Scheme.ContractScheme> {
        return this.contractDao.getByAddress(address);
    }

    public getByAddressAndProjectId(address: string, projectId: string): Promise<Scheme.ContractScheme> {
        return this.contractDao.getByAddressAndProjectId(address, projectId);
    }

    public listByFabricStatus(isFabric: boolean): Promise<Array<Scheme.ContractScheme>> {
        return this.contractDao.listByFabricStatus(isFabric);
    }

    public listByPublicStatus(isPublic: boolean): Promise<Array<Scheme.ContractScheme>> {
        return this.contractDao.listByPublicStatus(isPublic);
    }

    public listByIds(ids: Array<string>): Promise<Array<Scheme.ContractScheme>> {
        return this.contractDao.listByIds(ids);
    }

    public listByAddresses(addresses: Array<string>): Promise<Array<Scheme.ContractScheme>> {
        return this.contractDao.listByAddresses(addresses);
    }

    public createContract(
        projectId: string,
        address: string,
        abi: any
    ): Promise<Scheme.ContractScheme> {
        return this.contractDao.createContract(projectId, address, abi);
    }

    public setAbi(contractId: string, abi: any): Promise<void> {
        return this.contractDao.setAbi(contractId, abi);
    }

    public markAsFabric(contractId: string): Promise<void> {
        return this.contractDao.markAsFabric(contractId);
    }

    public markAsPublic(contractId: string): Promise<void> {
        return this.contractDao.markAsPublic(contractId);
    }
}
