import { MongoDBDao } from '@applicature/multivest.mongodb';
import { Scheme } from '../../types';
import { ProjectDao } from '../project.dao';

export class MongodbProjectDao extends MongoDBDao<Scheme.Project> implements ProjectDao {
    public getDaoId() {
        return 'projects';
    }

    public getCollectionName() {
        return 'projects';
    }

    public getDefaultValue() {
        return {} as Scheme.Project;
    }

    public async createProject(
        clientId: string,
        name: string,
        webhookUrl: string,
        sharedSecret: string,
        status: Scheme.ProjectStatus
    ): Promise<Scheme.Project> {
        return this.create({
            clientId,
            name,
            webhookUrl,
            sharedSecret,
            status,
            createdAt: new Date()
        });
    }

    public async getById(projectId: string) {
        return this.get({ id: projectId });
    }

    public async listByClientId(clientId: string): Promise<Array<Scheme.Project>> {
        return this.listRaw({
            clientId
        });
    }

    public async setNameAndWebhookUrlAndStatus(
        projectId: string,
        name: string, webhookUrl: string, status: Scheme.ProjectStatus
    ): Promise<void> {
        await this.updateRaw(
            {
                id: projectId
            },
            {
                $set: {
                    name,
                    webhookUrl,
                    status
                }
            }
        );

        return;
    }

    public async setStatus(projectId: string, status: Scheme.ProjectStatus): Promise<void> {
        await this.updateRaw(
            {
                id: projectId
            },
            {
                $set: {
                    status
                }
            }
        );

        return;
    }
}
