import * as config from 'config';
import { Db, MongoClient } from 'mongodb';
import { MongodbEthereumContractSubscriptionDao } from '../../src/dao/mongodb/ethereum.contract.subscription.dao';
import { Scheme } from '../../src/types';

import { omit, random } from 'lodash';
import { v1 as generateId } from 'uuid';

import { randomEthereumContractSubscription } from '../helper';

describe('ethereum contract subscription dao', () => {
    let dao: MongodbEthereumContractSubscriptionDao;
    const ethereumContractSubscriptions: Array<Scheme.EthereumContractSubscription> = [];
    const ethereumContractSubscriptionsCount = 15;
    let ethereumContractSubscription: Scheme.EthereumContractSubscription;
    let connection: Db;

    function getActiveSubscriptions() {
        return ethereumContractSubscriptions.filter((subscription) =>
            subscription.subscribed
            && subscription.isClientActive
            && subscription.isProjectActive
        );
    }

    beforeAll(async () => {
        connection = await MongoClient.connect(config.get('multivest.mongodb.url'), {});
        dao = new MongodbEthereumContractSubscriptionDao(connection);
        await dao.remove({});

        for (let i = 0; i < ethereumContractSubscriptionsCount; i++) {
            ethereumContractSubscriptions.push(await dao.create(randomEthereumContractSubscription()));
        }
    });

    beforeEach(() => {
        ethereumContractSubscription = ethereumContractSubscriptions[random(0, ethereumContractSubscriptionsCount - 1)];
    });

    afterAll(async () => {
        await dao.remove({});

        await connection.close();
    });

    it('should get by id', async () => {
        const got = await dao.getById(ethereumContractSubscription.id);

        expect(got).toEqual(ethereumContractSubscription);
    });

    it('should get by id (active only)', async () => {
        const subscription = getActiveSubscriptions()[0];

        if (!subscription) {
            return;
        }

        const got = await dao.getByIdActiveOnly(subscription.id);

        expect(got).toEqual(subscription);
    });

    it('should get by project id', async () => {
        const filtered = ethereumContractSubscriptions
            .filter((ecs) => ecs.projectId === ethereumContractSubscription.projectId);
        const got = await dao.listByProjectId(ethereumContractSubscription.projectId);

        expect(got).toEqual(filtered);
    });

    it('should get by project id (active only)', async () => {
        const filtered = getActiveSubscriptions()
            .filter((sub, index, subs) => sub.projectId === subs[0].projectId);

        if (filtered.length === 0) {
            return;
        }

        const got = await dao.listByProjectIdActiveOnly(filtered[0].projectId);

        expect(got).toEqual(filtered);
    });

    it('should get by client id', async () => {
        const filtered = ethereumContractSubscriptions
            .filter((ecs) => ecs.clientId === ethereumContractSubscription.clientId);
        const got = await dao.listByClientId(ethereumContractSubscription.clientId);

        expect(got).toEqual(filtered);
    });

    it('should get by client id (active only)', async () => {
        const filtered = getActiveSubscriptions()
            .filter((sub, index, subs) => sub.clientId === subs[0].clientId);

        if (filtered.length === 0) {
            return;
        }

        const got = await dao.listByClientIdActiveOnly(filtered[0].clientId);

        expect(got).toEqual(filtered);
    });

    it('should create new ethereum contract subscription', async () => {
        const data = randomEthereumContractSubscription();
        const created = await dao.createSubscription(
            data.clientId,
            data.projectId,
            data.compatibleStandard,
            data.blockchainId,
            data.networkId,
            data.address,
            data.minConfirmations,
            data.abi,
            data.abiEvents,
            data.subscribedEvents,
            data.subscribeAllEvents
        );

        const got = (await dao.listByProjectId(data.projectId))[0];

        expect(created).toEqual(got);
    });

    it('should get by id & project id & client id', async () => {
        const got = await dao.listBySubscribedAddress(
            ethereumContractSubscription.address,
            ethereumContractSubscription.clientId,
            ethereumContractSubscription.projectId
        );

        expect(got).toEqual([ethereumContractSubscription]);
    });

    it('should get by id & project id & client id (active only)', async () => {
        const filtered = getActiveSubscriptions()
            .filter((sub, index, subs) =>
                sub.projectId === subs[0].projectId
                && sub.clientId === subs[0].clientId
                && sub.address === subs[0].address
            );

        if (filtered.length === 0) {
            return;
        }

        const got = await dao.listBySubscribedAddressActiveOnly(
            filtered[0].address,
            filtered[0].clientId,
            filtered[0].projectId
        );

        expect(got).toEqual(filtered);
    });

    it('should set subscribed all events status', async () => {
        ethereumContractSubscription.subscribedEvents = ['data', 'exit'];
        ethereumContractSubscription.subscribeAllEvents = ethereumContractSubscription.subscribeAllEvents;

        await dao.setSubscribedEventsAndAllEvents(
            ethereumContractSubscription.id,
            ethereumContractSubscription.subscribedEvents,
            ethereumContractSubscription.subscribeAllEvents
        );

        const got = await dao.listByClientId(ethereumContractSubscription.clientId);

        expect(got).toEqual([ ethereumContractSubscription ]);
    });
});
