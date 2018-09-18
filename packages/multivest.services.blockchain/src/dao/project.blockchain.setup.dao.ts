import { Dao } from '@fluencesh/multivest.core';
import { Scheme } from '../types';

export abstract class ProjectBlockchainSetupDao extends Dao<Scheme.ProjectBlockchainSetup> {
    public abstract async createSetup(
        projectId: string,
        blockchainId: string,
        privateTransportConnectionId?: string
    ): Promise<Scheme.ProjectBlockchainSetup>;

    public abstract async getById(setupId: string): Promise<Scheme.ProjectBlockchainSetup>;
    public abstract async getByIdAndProjectId(
        setupId: string,
        projectId: string
    ): Promise<Scheme.ProjectBlockchainSetup>;
    public abstract async getByTransportConnectionIdAndProjectId(
        privateTransportConnectionId: string,
        projectId: string
    ): Promise<Scheme.ProjectBlockchainSetup>;

    public abstract async listByProjectId(projectId: string): Promise<Array<Scheme.ProjectBlockchainSetup>>;
    public abstract async listByProjectIdAndBlockchainId(
        projectId: string,
        blockchainId: string
    ): Promise<Array<Scheme.ProjectBlockchainSetup>>;

    public abstract setStatus(setupId: string, status: Scheme.ProjectBlockchainSetupStatus): Promise<void>;
    public abstract setStatusByProjectId(projectId: string, status: Scheme.ProjectBlockchainSetupStatus): Promise<void>;

    public abstract async removeById(setupId: string): Promise<void>;
    public abstract async removeByProjectId(projectId: string): Promise<void>;
}
