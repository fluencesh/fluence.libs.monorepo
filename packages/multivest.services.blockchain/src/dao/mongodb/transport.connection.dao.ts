import { MongoDBDao } from '@applicature-private/multivest.mongodb';
import { DaoCollectionNames, DaoIds } from '../../constants';
import { Scheme } from '../../types';
import { TransportConnectionDao } from '../transport.connection.dao';

export class MongodbTransportConnectionDao extends MongoDBDao<Scheme.TransportConnection>
    implements TransportConnectionDao {

    public getDaoId() {
        return DaoIds.TransportConnection;
    }

    public getCollectionName() {
        return DaoCollectionNames.TransportConnection;
    }

    public getDefaultValue() {
        return {} as Scheme.TransportConnection;
    }

    public async getById(id: string): Promise<Scheme.TransportConnection> {
        return this.getRaw({
            id
        });
    }

    public async getByBlockchainIdAndNetworkIdAndProviderId(
        blockchainId: string,
        networkId: string,
        providerId: string
    ): Promise<Scheme.TransportConnection> {
        return this.getRaw({
            blockchainId,
            networkId,
            providerId
        });
    }

    public async listByBlockchainAndNetwork(
        blockchainId: string,
        networkId: string
    ): Promise<Array<Scheme.TransportConnection>> {
        return this.listRaw({
            blockchainId,
            networkId
        });
    }

    public async listByBlockchainAndNetworkAndStatus(
        blockchainId: string,
        networkId: string,
        status: Scheme.TransportConnectionStatus
    ): Promise<Array<Scheme.TransportConnection>> {
        return this.listRaw({
            blockchainId,
            networkId,
            status
        });
    }

    public async listByBlockchainAndNetworkAndStatusAndCreatedAt(
        blockchainId: string,
        networkId: string,
        status: Scheme.TransportConnectionStatus,
        createdAt: Date,
        createdAtComparisonOperator: Scheme.ComparisonOperators
    ) {
        return this.listRaw({
            blockchainId,
            networkId,
            status,
            createdAt: {
                [ createdAtComparisonOperator ]: createdAt
            }
        });
    }

    public async listByIsPredefinedStatusAndBlockchainInfo(
        isPredefinedBySystem: boolean,
        blockchainId?: string,
        networkId?: string
    ) {
        const filters: Partial<Scheme.TransportConnection> = { isPredefinedBySystem };

        if (blockchainId) {
            filters.blockchainId = blockchainId;
        }
        if (networkId) {
            filters.networkId = networkId;
        }

        return this.list(filters);
    }

    public createTransportConnection(
        blockchainId: string,
        networkId: string,
        providerId: string,

        priority: number,

        settings: any,

        status: Scheme.TransportConnectionStatus,

        isFailing: boolean,
        lastFailedAt: Date,
        failedCount: number,

        isPrivate: boolean,

        isPredefinedBySystem: boolean = null
    ): Promise<Scheme.TransportConnection> {
        const data: Partial<Scheme.TransportConnection> = {
            blockchainId,
            networkId,
            providerId,

            priority,

            settings,

            status,

            isFailing,
            lastFailedAt,
            failedCount,

            isPrivate,

            createdAt: new Date(),
        };

        if (isPredefinedBySystem) {
            data.isPredefinedBySystem = isPredefinedBySystem;
        }

        return this.create(data);
    }

    public async setSettings(
        id: string,
        settings: any
    ) {
        await this.updateRaw({ id }, {
            $set: {
                settings
            }
        });
    }

    public async setStatus(
        id: string,
        status: Scheme.TransportConnectionStatus
    ) {
        await this.updateRaw({ id }, {
            $set: {
                status
            }
        });
    }

    public async setStatusByIds(
        ids: Array<string>,
        status: Scheme.TransportConnectionStatus
    ) {
        await this.updateRaw({
            id: {
                $in: ids
            }
        }, {
            $set: {
                status
            }
        });
    }

    public async setFailed(
        id: string,
        isFailing: boolean,
        at: Date
    ) {
        await this.updateRaw({ id }, {
            $set: {
                isFailing,
                lastFailedAt: at
            }
        });
    }

    public async setFailedByIds(
        ids: Array<string>,
        isFailing: boolean,
        at: Date
    ) {
        await this.updateRaw({
            id: {
                $in: ids
            }
        }, {
            $set: {
                isFailing,
                lastFailedAt: at
            }
        });
    }

    public async removeById(id: string): Promise<void> {
        await this.removeRaw({ id });
    }

    public async removeByIds(ids: Array<string>): Promise<void> {
        await this.removeRaw({ id: { $in: ids } });
    }
}
