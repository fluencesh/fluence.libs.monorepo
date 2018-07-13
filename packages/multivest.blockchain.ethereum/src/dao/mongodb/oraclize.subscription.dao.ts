import { MongoDBDao } from '@applicature/multivest.mongodb';
import { DaoCollectionNames, DaoIds } from '../../constants';
import { OraclizeStatus, OraclizeSubscription } from '../../types';
import { OraclizeSubscriptionDao } from '../oraclize.subscription.dao';

export class MongodbOraclizeSubscriptionDao
    extends MongoDBDao<OraclizeSubscription>
    implements OraclizeSubscriptionDao
{
    public getDaoId() {
        return DaoIds.Oraclize;
    }

    public getCollectionName() {
        return DaoCollectionNames.Oraclize;
    }

    public getDefaultValue() {
        return { } as OraclizeSubscription;
    }

    public async createOraclize(
        projectId: string,
        eventHash: string,
        eventName: string,
        eventInputTypes: Array<string>,
        webhookUrl: string
    ): Promise<OraclizeSubscription> {
        return this.create({
            projectId,
            eventHash,
            eventName,
            eventInputTypes,
            webhookUrl,
            status: OraclizeStatus.ENABLED
        });
    }

    public async getById(oraclizeId: string): Promise<OraclizeSubscription> {
        return this.getRaw({ id: oraclizeId });
    }

    public getByIdAndProjectId(oraclizeId: string, projectId: string): Promise<OraclizeSubscription> {
        return this.getRaw({ id: oraclizeId, projectId });
    }

    public async listByEventHash(eventHash: string): Promise<Array<OraclizeSubscription>> {
        return this.listRaw({ eventHash });
    }

    public async listByEventHashAndStatus(
        eventHash: string,
        status: OraclizeStatus
    ): Promise<Array<OraclizeSubscription>> {
        return this.listRaw({ eventHash, status });
    }

    public async listByEventHashes(eventHashes: Array<string>): Promise<Array<OraclizeSubscription>> {
        return this.listRaw({
            eventHash: {
                $in: eventHashes
            }
        });
    }

    public async listByEventHashesAndStatus(
        eventHashes: Array<string>,
        status: OraclizeStatus
    ): Promise<Array<OraclizeSubscription>> {
        return this.listRaw({
            eventHash: {
                $in: eventHashes
            },
            status
        });
    }

    public async listByProjectId(projectId: string): Promise<Array<OraclizeSubscription>> {
        return this.listRaw({ projectId });
    }

    public async listByStatus(status: OraclizeStatus): Promise<Array<OraclizeSubscription>> {
        return this.listRaw({ status });
    }

    public async listByStatusAndProjectId(
        status: OraclizeStatus,
        projectId: string
    ): Promise<Array<OraclizeSubscription>> {
        return this.listRaw({ status, projectId });
    }

    public async setStatus(oraclizeId: string, status: OraclizeStatus): Promise<void> {
        await this.updateRaw({ id: oraclizeId }, {
            $set: {
                status
            }
        });

        return;
    }
}
