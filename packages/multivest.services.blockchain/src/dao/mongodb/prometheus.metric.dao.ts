import { MongoDBDao } from '@fluencesh/multivest.mongodb';
import { DaoCollectionNames, DaoIds } from '../../constants';
import { Scheme } from '../../types';
import { PrometheusMetricDao } from '../prometheus.metric.dao';

export class MongodbPrometheusMetricDao
    extends MongoDBDao<Scheme.PrometheusMetric>
    implements PrometheusMetricDao
{
    public getCollectionName() {
        return DaoCollectionNames.PrometheusMetric;
    }

    public getDaoId() {
        return DaoIds.PrometheusMetric;
    }

    public getDefaultValue() {
        return {} as Scheme.PrometheusMetric;
    }

    public async createMetric(name: string, value: number): Promise<Scheme.PrometheusMetric> {
        return this.create({ name, value });
    }

    public async getById(id: string): Promise<Scheme.PrometheusMetric> {
        return this.getRaw({ id });
    }

    public async listAll(): Promise<Array<Scheme.PrometheusMetric>> {
        return this.listRaw({});
    }

    public async incrementMetricValue(id: string, incrementOn: number): Promise<void> {
        await this.updateRaw({ id }, {
            $inc: {
                value: incrementOn
            }
        });

        return;
    }

    public async setMetricValue(id: string, value: number): Promise<void> {
        await this.updateRaw({ id }, {
            $set: {
                value
            }
        });

        return;
    }

    public async resetMetricsByIds(ids: Array<string>): Promise<void> {
        await this.updateRaw({
            id: {
                $in: ids,
            }
        }, {
            $set: {
                value: 0
            }
        });

        return;
    }

    public async removeMetric(id: string): Promise<void> {
        await this.removeRaw({ id });

        return;
    }
}
