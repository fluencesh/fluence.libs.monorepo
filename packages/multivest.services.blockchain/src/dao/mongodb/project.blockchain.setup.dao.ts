import { MongoDBDao } from '@fluencesh/multivest.mongodb';
import { DaoCollectionNames, DaoIds } from '../../constants';
import { Scheme } from '../../types';
import { ProjectBlockchainSetupDao } from '../project.blockchain.setup.dao';

export class MongodbProjectBlockchainSetupDao extends MongoDBDao<Scheme.ProjectBlockchainSetup>
    implements ProjectBlockchainSetupDao {
    public getDaoId() {
        return DaoIds.ProjectBlockchainSetup;
    }

    public getCollectionName() {
        return DaoCollectionNames.ProjectBlockchainSetup;
    }

    public getDefaultValue() {
        return {} as Scheme.ProjectBlockchainSetup;
    }

    public async createSetup(
        projectId: string,
        blockchainId: string,
        privateTransportConnectionId?: string
    ): Promise<Scheme.ProjectBlockchainSetup> {
        return this.create({
            projectId,
            blockchainId,
            privateTransportConnectionId,
            status: Scheme.ProjectBlockchainSetupStatus.Enabled
        });
    }

    public async getById(setupId: string): Promise<Scheme.ProjectBlockchainSetup> {
        return this.getRaw({ id: setupId });
    }

    public async getByIdAndProjectId(setupId: string, projectId: string): Promise<Scheme.ProjectBlockchainSetup> {
        return this.getRaw({ id: setupId, projectId });
    }

    public async getByTransportConnectionId(
        privateTransportConnectionId: string
    ): Promise<Scheme.ProjectBlockchainSetup> {
        return this.getRaw({ privateTransportConnectionId });
    }

    public async getByTransportConnectionIdAndProjectId(
        privateTransportConnectionId: string,
        projectId: string
    ): Promise<Scheme.ProjectBlockchainSetup> {
        return this.getRaw({ privateTransportConnectionId, projectId });
    }

    public async listByProjectId(projectId: string): Promise<Array<Scheme.ProjectBlockchainSetup>> {
        return this.listRaw({ projectId });
    }

    public async listByProjectIdAndBlockchainId(
        projectId: string,
        blockchainId: string
    ): Promise<Array<Scheme.ProjectBlockchainSetup>> {
        return this.listRaw({ projectId, blockchainId });
    }

    public async setStatus(setupId: string, status: Scheme.ProjectBlockchainSetupStatus): Promise<void> {
        await this.updateRaw(
            { id: setupId },
            {
                $set: {
                    status
                }
            }
        );

        return;
    }

    public async setStatusByProjectId(projectId: string, status: Scheme.ProjectBlockchainSetupStatus): Promise<void> {
        await this.updateRaw(
            { projectId },
            {
                $set: {
                    status
                }
            }
        );

        return;
    }

    public async removeById(setupId: string): Promise<void> {
        await this.remove({ id: setupId });
    }

    public async removeByProjectId(projectId: string): Promise<void> {
        await this.remove({ projectId });
    }
}
