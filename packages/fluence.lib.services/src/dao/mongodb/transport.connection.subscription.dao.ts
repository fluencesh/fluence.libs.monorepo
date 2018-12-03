import { MultivestError } from '@applicature/synth.plugin-manager';
import { MongoDBDao } from '@applicature/synth.mongodb';
import { Scheme } from '../../types';
import { TransportConnectionSubscriptionDao } from '../transport.connection.subscription.dao';
import { DaoCollectionNames, DaoIds } from '../../constants';
import { Errors } from '../../errors';

// NOTICE: works as view (read-only). tables which in use:
// - transportConnections
// - addressSubscriptions
// - ethereumContractSubscriptions
// - transactionHashSubscriptions
// - oraclizeSubscriptions
// - fabricContractCreationSubscriptions
export class MongodbTransportConnectionSubscriptionDao extends MongoDBDao<Scheme.TransportConnectionSubscription>
    implements TransportConnectionSubscriptionDao
{
    public getCollectionName(): string {
        return DaoCollectionNames.TransportConnection;
    }

    public getDaoId(): string {
        return DaoIds.TransportConnectionSubscription;
    }

    public getDefaultValue() {
        return {} as Scheme.TransportConnectionSubscription;
    }

    public async getById(transportConnectionId: string): Promise<Scheme.TransportConnectionSubscription> {
        const matchFilter = { id: transportConnectionId };
        const pipeline = this.generatePipeline(matchFilter);

        return (await this.aggregateRaw(pipeline))[0] || null;
    }

    public async getByIdAndStatus(
        transportConnectionId: string,
        status: Scheme.TransportConnectionSubscriptionStatus
    ): Promise<Scheme.TransportConnectionSubscription> {
        const matchFilter = { id: transportConnectionId };
        const pipeline = this.generatePipelineForStatusCheck(status, matchFilter);

        return (await this.aggregateRaw(pipeline))[0] || null;
    }

    public async list() {
        const pipeline = this.generatePipeline();
        return this.aggregateRaw(pipeline);
    }

    public async listByStatus(status: Scheme.TransportConnectionSubscriptionStatus) {
        const pipeline = this.generatePipelineForStatusCheck(status);
        return this.aggregateRaw(pipeline);
    }

    public async listByIds(
        transportConnectionIds: Array<string>
    ): Promise<Array<Scheme.TransportConnectionSubscription>> {
        const matchFilter = {
            id: {
                $in: transportConnectionIds
            }
        };
        const pipeline = this.generatePipeline(matchFilter);

        return (await this.aggregateRaw(pipeline));
    }

    public async listByIdsAndStatus(
        transportConnectionIds: Array<string>,
        status: Scheme.TransportConnectionSubscriptionStatus
    ): Promise<Array<Scheme.TransportConnectionSubscription>> {
        const matchFilter: any = {
            id: {
                $in: transportConnectionIds
            }
        };
        const pipeline = this.generatePipelineForStatusCheck(status, matchFilter);

        return (await this.aggregateRaw(pipeline));
    }

    public async listByBlockchainInfo(
        blockchainId: string,
        networkId: string = null
    ): Promise<Array<Scheme.TransportConnectionSubscription>> {
        const matchFilter: any = { blockchainId };
        if (networkId) {
            matchFilter.networkId = networkId;
        }

        const pipeline = this.generatePipeline(matchFilter);

        return this.aggregateRaw(pipeline);
    }

    public async listByStatusAndBlockchainInfo(
        status: Scheme.TransportConnectionSubscriptionStatus,
        blockchainId: string,
        networkId: string = null
    ): Promise<Array<Scheme.TransportConnectionSubscription>> {
        const matchFilter: any = { blockchainId };
        if (networkId) {
            matchFilter.networkId = networkId;
        }

        const pipeline = this.generatePipelineForStatusCheck(status, matchFilter);

        return this.aggregateRaw(pipeline);
    }

    public async create(): Promise<Scheme.TransportConnectionSubscription> {
        throw new MultivestError(Errors.NOT_AVAILABLE_FOR_VIEW);
    }

    public async fill(): Promise<Array<Scheme.TransportConnectionSubscription>> {
        throw new MultivestError(Errors.NOT_AVAILABLE_FOR_VIEW);
    }

    public async update(): Promise<Scheme.TransportConnectionSubscription> {
        throw new MultivestError(Errors.NOT_AVAILABLE_FOR_VIEW);
    }

    public async updateRaw(): Promise<Scheme.TransportConnectionSubscription> {
        throw new MultivestError(Errors.NOT_AVAILABLE_FOR_VIEW);
    }

    public async remove(): Promise<Scheme.TransportConnectionSubscription> {
        throw new MultivestError(Errors.NOT_AVAILABLE_FOR_VIEW);
    }

    public async removeRaw(): Promise<Scheme.TransportConnectionSubscription> {
        throw new MultivestError(Errors.NOT_AVAILABLE_FOR_VIEW);
    }

    private generatePipeline(matchFilter: any = {}) {
        const pipeline: Array<any> = [
            {
                $lookup: {
                    from: DaoCollectionNames.AddressSubscription,
                    localField: 'id',
                    foreignField: 'transportConnectionId',
                    as: 'addressSubscriptions'
                }
            },
            {
                $lookup: {
                    from: DaoCollectionNames.EthereumContractSubscription,
                    localField: 'id',
                    foreignField: 'transportConnectionId',
                    as: 'contractSubscriptions'
                }
            },
            {
                $lookup: {
                    from: DaoCollectionNames.TransactionHashSubscription,
                    localField: 'id',
                    foreignField: 'transportConnectionId',
                    as: 'transactionHashSubscriptions'
                }
            },
            {
                $lookup: {
                    from: DaoCollectionNames.Oraclize,
                    localField: 'id',
                    foreignField: 'transportConnectionId',
                    as: 'oraclizeSubscriptions'
                }
            },
            {
                $lookup: {
                    from: DaoCollectionNames.FabricContractCreation,
                    localField: 'id',
                    foreignField: 'transportConnectionId',
                    as: 'fabricContractCreationSubscriptions'
                }
            },
        ];

        pipeline.push({ $match: matchFilter });

        return pipeline;
    }

    private generatePipelineForStatusCheck(
        status: Scheme.TransportConnectionSubscriptionStatus,
        matchFilter: any = {}
    ) {
        const pipeline = this.generatePipeline(matchFilter);

        if (
            status === Scheme.TransportConnectionSubscriptionStatus.Subscribed
            || status === Scheme.TransportConnectionSubscriptionStatus.Unsubscribed
        ) {
            const subscribed = status === Scheme.TransportConnectionSubscriptionStatus.Subscribed;

            matchFilter.$or = [
                { 'addressSubscriptions.subscribed': subscribed },
                { 'contractSubscriptions.subscribed': subscribed },
                { 'transactionHashSubscriptions.subscribed': subscribed },
                { 'oraclizeSubscriptions.subscribed': subscribed },
                { 'fabricContractCreationSubscriptions.subscribed': subscribed },
            ];

            const filter = {
                $project: {
                    id: 1,
                    blockchainId: 1,
                    networkId: 1,
                    providerId: 1,
                    priority: 1,
                    settings: 1,
                    status: 1,
                    isPrivate: 1,
                    isFailing: 1,
                    lastFailedAt: 1,
                    failedCount: 1,
                    createdAt: 1,
                    isPredefinedBySystem: 1,

                    addressSubscriptions: {
                        $filter: {
                            input: '$addressSubscriptions',
                            as: 'addressSubscription',
                            cond: { $eq: [ '$$addressSubscription.subscribed', subscribed ] }
                        }
                    },
                    contractSubscriptions: {
                        $filter: {
                            input: '$contractSubscriptions',
                            as: 'contractSubscription',
                            cond: { $eq: [ '$$contractSubscription.subscribed', subscribed ] }
                        }
                    },
                    transactionHashSubscriptions: {
                        $filter: {
                            input: '$transactionHashSubscriptions',
                            as: 'transactionHashSubscription',
                            cond: { $eq: [ '$$transactionHashSubscription.subscribed', subscribed ] }
                        }
                    },
                    oraclizeSubscriptions: {
                        $filter: {
                            input: '$oraclizeSubscriptions',
                            as: 'oraclizeSubscription',
                            cond: { $eq: [ '$$oraclizeSubscription.subscribed', subscribed ] }
                        }
                    },
                    fabricContractCreationSubscriptions: {
                        $filter: {
                            input: '$fabricContractCreationSubscriptions',
                            as: 'fabricContractCreationSubscription',
                            cond: { $eq: [ '$$fabricContractCreationSubscription.subscribed', subscribed ] }
                        }
                    }
                }
            };

            pipeline.push(filter);
        }

        return pipeline;
    }
}
