import { PluginManager, Service } from '@applicature-private/multivest.core';
import * as config from 'config';

export abstract class MetricService extends Service {
    protected env: string;

    constructor(pluginManager: PluginManager) {
        super(pluginManager);

        this.env = config.util.getEnv('NODE_ENV') || 'no.env';
    }

    public async blockchainCalled(
        blockchainId: string,
        networkId: string,
        times: number = 1,
        timestamp: Date = new Date()
    ): Promise<void> {
        await this.saveMetric(`${ blockchainId }.${ networkId }.calls.${ this.env }`, times, timestamp);

        return;
    }

    public async activeBlockchainNodes(
        blockchainId: string,
        networkId: string,
        count: number,
        timestamp: Date = new Date()
    ): Promise<void> {
        await this.saveMetric(`${ blockchainId }.${ networkId }.active.nodes.${ this.env }`, count, timestamp);

        return;
    }

    public async healthyBlockchainNodes(
        blockchainId: string,
        networkId: string,
        count: number,
        timestamp: Date = new Date()
    ): Promise<void> {
        await this.saveMetric(`${ blockchainId }.${ networkId }.healthy.nodes.${ this.env }`, count, timestamp);

        return;
    }

    public async unhealthyBlockchainNodes(
        blockchainId: string,
        networkId: string,
        count: number,
        timestamp: Date = new Date()
    ): Promise<void> {
        await this.saveMetric(`${ blockchainId }.${ networkId }.unhealthy.nodes.${ this.env }`, count, timestamp);

        return;
    }

    public async clientsRegistered(count: number = 1, timestamp: Date = new Date()): Promise<void> {
        await this.saveMetric(`clients.registered.${ this.env }`, count, timestamp);

        return;
    }

    public async clientsEmailVerified(count: number = 1, timestamp: Date = new Date()): Promise<void> {
        await this.saveMetric(`clients.email.verified.${ this.env }`, count, timestamp);

        return;
    }

    public async clientsPasswordRestored(count: number = 1, timestamp: Date = new Date()): Promise<void> {
        await this.saveMetric(`clients.password.restored.${ this.env }`, count, timestamp);

        return;
    }

    public async projectsCreated(count: number = 1, timestamp: Date = new Date()): Promise<void> {
        await this.saveMetric(`projects.created.${ this.env }`, count, timestamp);

        return;
    }

    public async projectsActivated(count: number = 1, timestamp: Date = new Date()): Promise<void> {
        await this.saveMetric(`projects.activated.${ this.env }`, count, timestamp);

        return;
    }

    public async projectsInactivated(count: number = 1, timestamp: Date = new Date()): Promise<void> {
        await this.saveMetric(`projects.inactivated.${ this.env }`, count, timestamp);

        return;
    }

    public async transactionsFoundInBlock(
        blockchainId: string,
        networkId: string,
        count: number = 1,
        timestamp: Date = new Date()
    ): Promise<void> {
        await this.saveMetric(
            `${ blockchainId }.${ networkId }.transactions.found.in.block.${ this.env }`,
            count,
            timestamp
        );

        return;
    }

    public async contractsEventFoundInBlock(
        blockchainId: string,
        networkId: string,
        count: number = 1,
        timestamp: Date = new Date()
    ): Promise<void> {
        await this.saveMetric(
            `${ blockchainId }.${ networkId }.contracts.event.found.in.block.${ this.env }`,
            count,
            timestamp
        );

        return;
    }

    public async addressFoundInBlock(
        blockchainId: string,
        networkId: string,
        count: number = 1,
        timestamp: Date = new Date()
    ): Promise<void> {
        await this.saveMetric(
            `${ blockchainId }.${ networkId }.address.found.in.block.${ this.env }`,
            count,
            timestamp
        );

        return;
    }

    public async transactionsSuccessfullySent(
        blockchainId: string,
        networkId: string,
        count: number = 1,
        timestamp: Date = new Date()
    ): Promise<void> {
        await this.saveMetric(
            `${ blockchainId }.${ networkId }.transaction.successfully.sent.${ this.env }`,
            count,
            timestamp
        );

        return;
    }

    public async transactionsUnsuccessfullySent(
        blockchainId: string,
        networkId: string,
        count: number = 1,
        timestamp: Date = new Date()
    ): Promise<void> {
        await this.saveMetric(
            `${ blockchainId }.${ networkId }.transaction.unsuccessfully.sent.${ this.env }`,
            count,
            timestamp
        );

        return;
    }

    public async incomingHttpRequests(count: number = 1, timestamp: Date = new Date()): Promise<void> {
        await this.saveMetric(`incoming.http.requests.${ this.env }`, count, timestamp);

        return;
    }

    public async httpRequestsSuccessfullyExecuted(count: number = 1, timestamp: Date = new Date()): Promise<void> {
        await this.saveMetric(`http.requests.successfully.executed.${ this.env }`, count, timestamp);

        return;
    }

    public async httpRequestsUnsuccessfullyExecuted(count: number = 1, timestamp: Date = new Date()): Promise<void> {
        await this.saveMetric(`http.requests.unsuccessfully.executed.${ this.env }`, count, timestamp);

        return;
    }

    public async httpRequestsTimeout(count: number = 1, timestamp: Date = new Date()): Promise<void> {
        await this.saveMetric(`http.requests.timeout.${ this.env }`, count, timestamp);

        return;
    }

    public async webhooksSuccessfullyCalled(count: number = 1, timestamp: Date = new Date()): Promise<void> {
        await this.saveMetric(`webhook.successfully.called.${ this.env }`, count, timestamp);

        return;
    }

    public async webhooksUnsuccessfullyCalled(count: number = 1, timestamp: Date = new Date()): Promise<void> {
        await this.saveMetric(`webhook.unsuccessfully.called.${ this.env }`, count, timestamp);

        return;
    }

    public async webhooksDelayedOnOneSec(count: number = 1, timestamp: Date = new Date()): Promise<void> {
        await this.saveMetric(`webhook.delay.on.1.sec.${ this.env }`, count, timestamp);

        return;
    }

    public async webhooksDelayedOnThreeSec(count: number = 1, timestamp: Date = new Date()): Promise<void> {
        await this.saveMetric(`webhook.delay.on.3.sec.${ this.env }`, count, timestamp);

        return;
    }

    public async webhooksDelayedOnFiveSec(count: number = 1, timestamp: Date = new Date()): Promise<void> {
        await this.saveMetric(`webhook.delay.on.5.sec.${ this.env }`, count, timestamp);

        return;
    }

    public async webhooksDelayedOnTenSec(count: number = 1, timestamp: Date = new Date()): Promise<void> {
        await this.saveMetric(`webhook.delay.on.10.sec.${ this.env }`, count, timestamp);

        return;
    }

    public async webhooksDelayedOnSixtySec(count: number = 1, timestamp: Date = new Date()): Promise<void> {
        await this.saveMetric(`webhook.delay.on.60.sec.${ this.env }`, count, timestamp);

        return;
    }

    protected abstract saveMetric(name: string, value?: number, timestamp?: Date): Promise<void>;
}
