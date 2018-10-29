import { MongoDBDao } from '@applicature-private/core.mongodb';
import { DaoCollectionNames, DaoIds } from '../../constants';
import { Scheme } from '../../types';
import { ContractPublicRequestDao } from '../contract.public.request.dao';

export class MongodbContractPublicRequestDao extends MongoDBDao<Scheme.ContractPublicRequest>
    implements ContractPublicRequestDao {
    public getCollectionName() {
        return DaoCollectionNames.ContractPublicRequest;
    }

    public getDaoId() {
        return DaoIds.ContractPublicRequest;
    }

    public getDefaultValue() {
        return {} as Scheme.ContractPublicRequest;
    }

    public async createPublicContractRequest(
        clientId: string,
        contractId: string,
        description: string
    ): Promise<Scheme.ContractPublicRequest> {
        return this.create({
            clientId,
            contractId,
            description,
            adminId: null,
            adminResolution: null,
            adminResolutionStatus: null
        });
    }

    public async getById(requestId: string): Promise<Scheme.ContractPublicRequest> {
        return this.getRaw({
            id: requestId
        });
    }

    public async listAll(): Promise<Array<Scheme.ContractPublicRequest>> {
        return this.listRaw({});
    }

    public async listByClient(clientId: string): Promise<Array<Scheme.ContractPublicRequest>> {
        return this.listRaw({ clientId });
    }

    public async listByStatus(
        adminResolutionStatus: Scheme.AdminResolutionStatus
    ): Promise<Array<Scheme.ContractPublicRequest>> {
        return this.listRaw({ adminResolutionStatus });
    }

    public async listByClientIdAndStatus(
        clientId: string,
        adminResolutionStatus: Scheme.AdminResolutionStatus
    ): Promise<Array<Scheme.ContractPublicRequest>> {
        return this.listRaw({ clientId, adminResolutionStatus });
    }

    public async listUnresolvedRequests(): Promise<Array<Scheme.ContractPublicRequest>> {
        return this.listRaw({
            adminId: null,
            adminResolution: null,
            adminResolutionStatus: null
        });
    }

    public async setResolution(
        requestId: string,
        adminId: string,
        adminResolution: string,
        adminResolutionStatus: Scheme.AdminResolutionStatus
    ): Promise<void> {
        this.updateRaw({ id: requestId }, {
            $set: {
                adminId,
                adminResolution,
                adminResolutionStatus
            }
        });
    }
}
