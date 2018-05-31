import { Dao } from '@applicature/multivest.core';
import { Scheme } from '../types';

export abstract class ContractPublicRequestDao extends Dao<Scheme.ContractPublicRequest> {
    public abstract createPublicContractRequest(
        clientId: string,
        contractId: string,
        description: string
    ): Promise<Scheme.ContractPublicRequest>;

    public abstract getById(requestId: string): Promise<Scheme.ContractPublicRequest>;
    public abstract listByStatus(adminResolutionStatus: Scheme.AdminResolutionStatus)
        : Promise<Array<Scheme.ContractPublicRequest>>;
    public abstract listByClient(clientId: string): Promise<Array<Scheme.ContractPublicRequest>>;
    public abstract listByClientIdAndStatus(clientId: string, adminResolutionStatus: Scheme.AdminResolutionStatus)
        : Promise<Array<Scheme.ContractPublicRequest>>;
    public abstract listUnresolvedRequests(): Promise<Array<Scheme.ContractPublicRequest>>;
    public abstract listAll(): Promise<Array<Scheme.ContractPublicRequest>>;

    public abstract setResolution(
        requestId: string,
        adminId: string,
        adminResolution: string,
        adminResolutionStatus: Scheme.AdminResolutionStatus
    ): Promise<void>;
}
