import { MongoDBDao } from '@applicature/multivest.mongodb';
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

    public async listByBlockchainAndNetwork(
        blockchainId: string,
        networkId: string
    ): Promise<Array<Scheme.TransportConnection>> {
        return this.list({
            blockchainId,
            networkId
        });
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
        failedCount: number
    ): Promise<Scheme.TransportConnection> {
        return this.create({
            blockchainId,
            networkId,
            providerId,

            priority,

            settings,

            status,

            isFailing,
            lastFailedAt,
            failedCount,

            createdAt: new Date()
        });
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

        return;
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

        return;
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

        return;
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

        return;
    }
}
