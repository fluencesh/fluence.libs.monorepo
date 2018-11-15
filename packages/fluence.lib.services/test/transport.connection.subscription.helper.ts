import { Scheme, DaoCollectionNames } from '../src';
import { sortBy, omit } from 'lodash';

//#region integration
export function convertTcsByStatus(
    tcs: Scheme.TransportConnectionSubscription,
    status: Scheme.TransportConnectionSubscriptionStatus
) {
    const clone: Scheme.TransportConnectionSubscription = Object.assign<any, any>(
        {},
        omit(tcs, [
            'addressSubscriptions', 'contractSubscriptions', 'transactionHashSubscriptions', 'oraclizeSubscriptions'
        ])
    );

    const subscribed = status === Scheme.TransportConnectionSubscriptionStatus.Subscribed;
    clone.addressSubscriptions =
        tcs.addressSubscriptions.filter((s) => s.subscribed === subscribed);
    clone.contractSubscriptions =
        tcs.contractSubscriptions.filter((s) => s.subscribed === subscribed);
    clone.transactionHashSubscriptions =
        tcs.transactionHashSubscriptions.filter((s) => s.subscribed === subscribed);
    clone.oraclizeSubscriptions =
        tcs.oraclizeSubscriptions.filter((s) => s.subscribed === subscribed);

    if (
        clone.addressSubscriptions.length || clone.contractSubscriptions.length
        || clone.transactionHashSubscriptions.length || clone.oraclizeSubscriptions.length
    ) {
        return clone;
    } else {
        return null;
    }
}

export function compareTcs(
    actual: Scheme.TransportConnectionSubscription,
    expected: Scheme.TransportConnectionSubscription
) {
    if (!actual || !expected) {
        expect(actual).toEqual(expected);
        return;
    }

    expect(actual.id).toEqual(expected.id);
    expect(actual.blockchainId).toEqual(expected.blockchainId);
    expect(actual.failedCount).toEqual(expected.failedCount);
    expect(actual.isFailing).toEqual(expected.isFailing);
    expect(actual.isPredefinedBySystem).toEqual(expected.isPredefinedBySystem);
    expect(actual.isPrivate).toEqual(expected.isPrivate);
    expect(actual.networkId).toEqual(expected.networkId);
    expect(actual.priority).toEqual(expected.priority);
    expect(actual.providerId).toEqual(expected.providerId);
    expect(actual.settings).toEqual(expected.settings);
    expect(actual.status).toEqual(expected.status);

    sortBy(actual.addressSubscriptions, 'id');
    sortBy(actual.oraclizeSubscriptions, 'id');
    sortBy(actual.transactionHashSubscriptions, 'id');
    sortBy(actual.contractSubscriptions, 'id');

    sortBy(expected.addressSubscriptions, 'id');
    sortBy(expected.oraclizeSubscriptions, 'id');
    sortBy(expected.transactionHashSubscriptions, 'id');
    sortBy(expected.contractSubscriptions, 'id');

    expect(actual.addressSubscriptions.length).toEqual(expected.addressSubscriptions.length);
    expect(actual.oraclizeSubscriptions.length).toEqual(expected.oraclizeSubscriptions.length);
    expect(actual.transactionHashSubscriptions.length).toEqual(expected.transactionHashSubscriptions.length);
    expect(actual.contractSubscriptions.length).toEqual(expected.contractSubscriptions.length);

    expect(actual.addressSubscriptions).toEqual(expected.addressSubscriptions);
    expect(actual.oraclizeSubscriptions).toEqual(expected.oraclizeSubscriptions);
    expect(actual.transactionHashSubscriptions).toEqual(expected.transactionHashSubscriptions);
    expect(actual.contractSubscriptions).toEqual(expected.contractSubscriptions);
}

export function compareTcsArrays(
    actual: Array<Scheme.TransportConnectionSubscription>,
    expected: Array<Scheme.TransportConnectionSubscription>
) {
    expect(actual.length).toEqual(expected.length);

    sortBy(actual, 'id');
    sortBy(expected, 'id');

    for (let index = 0; index < expected.length; index++) {
        compareTcs(actual[index], expected[index]);
    }
}

export function convertListOfTcsByStatus(
    tcss: Array<Scheme.TransportConnectionSubscription>,
    status: Scheme.TransportConnectionSubscriptionStatus
) {
    return tcss.map((tcs) => convertTcsByStatus(tcs, status)).filter((tcs) => !!tcs);
}
//#endregion

//#region unit
export function generatePipeline(matchFilter: any = {}) {
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
    ];

    pipeline.push({ $match: matchFilter });

    return pipeline;
}

export function generatePipelineForStatusCheck(
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
                }
            }
        };

        pipeline.push(filter);
    }

    return pipeline;
}
//#endregion
