import { MultivestError, Service } from '@applicature-private/multivest.core';
import { Plugin } from '@applicature-private/multivest.mongodb';
import { DaoIds } from '../../constants';
import { ContractPublicRequestDao } from '../../dao/contract.public.request.dao';
import { Errors } from '../../errors';
import { Scheme } from '../../types';
import { ContractService } from './contract.service';

export class ContractPublicRequestService extends Service {
    private contractPublicRequestDao: ContractPublicRequestDao;
    private contractService: ContractService;

    public getServiceId() {
        return 'contract.public.request.service';
    }

    public async init(): Promise<void> {
        const mongodbPlugin = this.pluginManager.get('mongodb') as any as Plugin;

        this.contractPublicRequestDao =
            await mongodbPlugin.getDao(DaoIds.ContractPublicRequest) as ContractPublicRequestDao;

        this.contractService = this.pluginManager.getServiceByClass(ContractService) as ContractService;
    }

    public async createPublicContractRequest(
        clientId: string,
        contractId: string,
        description: string,
        isFabric: boolean
    ): Promise<Scheme.ContractPublicRequest> {
        const contract = await this.contractService.getById(contractId);
        if (!contract) {
            throw new MultivestError(Errors.CONTRACT_NOT_FOUND);
        }

        const request = await this
            .contractPublicRequestDao.createPublicContractRequest(clientId, contractId, description);

        if (isFabric) {
            await this.contractService.markAsFabric(contractId);
        }

        return request;
    }

    public getById(requestId: string): Promise<Scheme.ContractPublicRequest> {
        return this.contractPublicRequestDao.getById(requestId);
    }

    public listByStatus(
        adminResolutionStatus: Scheme.AdminResolutionStatus
    ): Promise<Array<Scheme.ContractPublicRequest>> {
        return this.contractPublicRequestDao.listByStatus(adminResolutionStatus);
    }

    public listByClient(
        clientId: string
    ): Promise<Array<Scheme.ContractPublicRequest>> {
        return this.contractPublicRequestDao.listByClient(clientId);
    }

    public listByClientIdAndStatus(
        clientId: string,
        adminResolutionStatus: Scheme.AdminResolutionStatus
    ): Promise<Array<Scheme.ContractPublicRequest>> {
        return this.contractPublicRequestDao.listByClientIdAndStatus(clientId, adminResolutionStatus);
    }

    public listUnresolvedRequests(): Promise<Array<Scheme.ContractPublicRequest>> {
        return this.contractPublicRequestDao.listUnresolvedRequests();
    }

    public listAll(): Promise<Array<Scheme.ContractPublicRequest>> {
        return this.contractPublicRequestDao.listAll();
    }

    public async setResolution(
        requestId: string,
        adminId: string,
        adminResolution: string,
        adminResolutionStatus: Scheme.AdminResolutionStatus
    ): Promise<void> {
        await this.contractPublicRequestDao.setResolution(requestId, adminId, adminResolution, adminResolutionStatus);

        if (adminResolutionStatus === Scheme.AdminResolutionStatus.APPROVE) {
            const request = await this.getById(requestId);

            await this.contractService.markAsPublic(request.contractId);
        }
    }
}
