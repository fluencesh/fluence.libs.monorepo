import { Plugin } from '@applicature-private/multivest.core';
import { HttpRequestMetricService } from './services';

export class FluenceMsPlugin extends Plugin<void> {
    public getPluginId() {
        return 'metric.ms';
    }

    public init() {
        this.registerService(HttpRequestMetricService);
    }
}

export { FluenceMsPlugin as Plugin };
