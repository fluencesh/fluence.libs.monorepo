import { Dao } from '@fluencesh/multivest.core';
import { Scheme } from '../types';

export abstract class PrometheusMetricDao extends Dao<Scheme.PrometheusMetric> {
    public abstract createMetric(
        name: string,
        value: number
    ): Promise<Scheme.PrometheusMetric>;

    public abstract getById(id: string): Promise<Scheme.PrometheusMetric>;

    public abstract listAll(): Promise<Array<Scheme.PrometheusMetric>>;

    public abstract incrementMetricValue(
        id: string,
        incrementOn: number
    ): Promise<void>;

    public abstract setMetricValue(
        id: string,
        value: number
    ): Promise<void>;

    public abstract resetMetricsByIds(ids: Array<string>): Promise<void>;

    public abstract removeMetric(id: string): Promise<void>;
}
