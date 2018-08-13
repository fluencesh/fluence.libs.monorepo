import { MongoDBDao } from '@applicature-private/multivest.mongodb';
import * as logger from 'winston';
import { DaoCollectionNames, DaoIds } from '../../constants';
import { Scheme } from '../../types';
import { ProjectDao } from '../project.dao';

export class MongodbProjectDao extends MongoDBDao<Scheme.Project> implements ProjectDao {
    public getDaoId() {
        return DaoIds.Project;
    }

    public getCollectionName() {
        return DaoCollectionNames.Project;
    }

    public getDefaultValue() {
        return {} as Scheme.Project;
    }

    public async createProject(
        clientId: string,
        name: string,
        webhookUrl: string,
        sharedSecret: string,
        status: Scheme.ProjectStatus,
        txMinConfirmations: number,
        saltyToken: string,
        salt: string
    ): Promise<Scheme.Project> {
        return this.create({
            clientId,
            name,
            webhookUrl,
            sharedSecret,
            status,
            createdAt: new Date(),
            txMinConfirmations,
            saltyToken,
            salt,
            isRemoved: false,
            removedAt: null
        });
    }

    public async getById(projectId: string) {
        return this.get({
            id: projectId
        });
    }

    public async getByIdActiveOnly(projectId: string) {
        return this.get({
            id: projectId,
            status: Scheme.ProjectStatus.Active,
            isRemoved: false
        });
    }

    public async getByIdExistsOnly(projectId: string) {
        return this.get({
            id: projectId,
            isRemoved: false
        });
    }

    public async listByClientId(clientId: string): Promise<Array<Scheme.Project>> {
        return this.listRaw({
            clientId
        });
    }

    public async listByClientIdActiveOnly(clientId: string): Promise<Array<Scheme.Project>> {
        return this.listRaw({
            clientId,
            status: Scheme.ProjectStatus.Active,
            isRemoved: false
        });
    }

    public async listByIds(ids: Array<string>): Promise<Array<Scheme.Project>> {
        return this.listRaw({
            id: { $in: ids }
        });
    }

    public async listByIdsActiveOnly(ids: Array<string>): Promise<Array<Scheme.Project>> {
        return this.listRaw({
            id: { $in: ids },
            status: Scheme.ProjectStatus.Active,
            isRemoved: false
        });
    }

    public async listByFilters(
        name?: string,
        sharedSecret?: string,
        status?: Scheme.ProjectStatus,
        webhookUrl?: string
    ): Promise<Array<Scheme.Project>> {
        const filters: Partial<Scheme.Project> = {};
        if (name) {
            filters.name = name;
        }
        if (sharedSecret) {
            filters.sharedSecret = sharedSecret;
        }
        if (status) {
            filters.status = status;
        }
        if (webhookUrl) {
            filters.webhookUrl = webhookUrl;
        }
        if (!Object.keys(filters).length) {
            logger.warn('at least one filter should be specified');
            return [];
        }

        return this.listRaw(filters);
    }

    public async listByFiltersActiveOnly(
        name?: string,
        sharedSecret?: string,
        status?: Scheme.ProjectStatus,
        webhookUrl?: string
    ): Promise<Array<Scheme.Project>> {
        const filters: Partial<Scheme.Project> = {};
        if (name) {
            filters.name = name;
        }
        if (sharedSecret) {
            filters.sharedSecret = sharedSecret;
        }
        if (status) {
            filters.status = status;
        }
        if (webhookUrl) {
            filters.webhookUrl = webhookUrl;
        }
        if (!Object.keys(filters).length) {
            logger.warn('at least one filter should be specified');

            return [];
        }

        filters.status = Scheme.ProjectStatus.Active;
        filters.isRemoved = false;

        return this.listRaw(filters);
    }

    public async setNameAndWebhookUrlAndStatus(
        projectId: string,
        name?: string,
        webhookUrl?: string,
        status?: Scheme.ProjectStatus
    ): Promise<void> {
        const data: Partial<Scheme.Project> = {};
        if (name) {
            data.name = name;
        }
        if (status) {
            data.status = status;
        }
        if (webhookUrl) {
            data.webhookUrl = webhookUrl;
        }
        if (!Object.keys(data).length) {
            logger.warn('at least one of project field should be specified');

            return;
        }

        await this.updateRaw({ id: projectId }, { $set: data });

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

    public async setToken(
        projectId: string,
        saltyToken: string,
        salt: string
    ) {
        await this.updateRaw({ id: projectId }, {
            $set: {
                saltyToken,
                salt
            }
        });

        return;
    }

    public async removeProject(projectId: string): Promise<void> {
        await this.updateRaw(
            { id: projectId },
            {
                $set: {
                    isRemoved: true,
                    removedAt: new Date()
                }
            }
        );
    }
}
