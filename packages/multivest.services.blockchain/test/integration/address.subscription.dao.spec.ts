import * as config from 'config';
import { Db, MongoClient } from 'mongodb';
import { MongodbAddressSubscriptionDao } from '../../src/dao/mongodb/address.subscription.dao';
import { Scheme } from '../../src/types';

import { random } from 'lodash';
import { v1 as generateId } from 'uuid';

import { randomAddressSubscription } from '../helper';

describe('address subscription dao', () => {
    let dao: MongodbAddressSubscriptionDao;
    const addressSubscriptions: Array<Scheme.AddressSubscription> = [];
    const addressSubscriptionsCount = 15;
    let addressSubscription: Scheme.AddressSubscription;
    let connection: Db;

    beforeAll(async () => {
        connection = await MongoClient.connect(config.get('multivest.mongodb.url'), {});
        dao = new MongodbAddressSubscriptionDao(connection);
        dao.remove({});

        for (let i = 0; i < addressSubscriptionsCount; i++) {
            addressSubscriptions.push(await dao.create(randomAddressSubscription()));
        }
    });

    beforeEach(() => {
        addressSubscription = addressSubscriptions[random(0, addressSubscriptionsCount - 1)];
    });

    afterAll(async () => {
        await connection.db('multivest').collection('addressSubscriptions').remove({});

        connection.close();
    });

    it('should get by id', async () => {
        const got = await dao.getById(addressSubscription.id);
        expect(got).toEqual(addressSubscription);
    });

    it('should get by client id', async () => {
        const filtered = addressSubscriptions.filter((as) => as.clientId === addressSubscription.clientId);
        const got = await dao.listByClientId(addressSubscription.clientId);
        expect(got).toEqual(filtered);
    });

    it('should get by project id', async () => {
        const filtered = addressSubscriptions.filter((as) => as.projectId === addressSubscription.projectId);
        const got = await dao.listByProjectId(addressSubscription.projectId);
        expect(got).toEqual(filtered);
    });

    it('should get by id & project id & client id', async () => {
        const got = await dao.listBySubscribedAddress(
            addressSubscription.address,
            addressSubscription.clientId,
            addressSubscription.projectId
        );

        expect(got).toEqual([addressSubscription]);
    });

    it('should set new subscriber status', async () => {
        addressSubscription.subscribed = !addressSubscription.subscribed;
        await dao.setSubscribed(addressSubscription.id, addressSubscription.subscribed);
        const got = await dao.getById(addressSubscription.id);
        expect(got.subscribed).toEqual(addressSubscription.subscribed);
    });

    it('should set new is client active status', async () => {
        addressSubscription.isClientActive = !addressSubscription.isClientActive;
        await dao.setClientActive(addressSubscription.clientId, addressSubscription.isClientActive);
        const got = await dao.listByClientId(addressSubscription.clientId);

        const filtered = addressSubscriptions.filter((as) => as.clientId === addressSubscription.clientId);
        filtered.forEach((as) => {
            as.isClientActive = addressSubscription.isClientActive;
        });

        expect(got).toEqual(filtered);
    });

    it('should set new is project active status', async () => {
        addressSubscription.isProjectActive = !addressSubscription.isProjectActive;
        await dao.setProjectActive(addressSubscription.projectId, addressSubscription.isProjectActive);

        const got = await dao.listByProjectId(addressSubscription.projectId);

        const filtered = addressSubscriptions.filter((as) => as.projectId === addressSubscription.projectId);
        filtered.forEach((as) => {
            as.isProjectActive = addressSubscription.isProjectActive;
        });

        expect(got).toEqual(filtered);
    });

    it('should create subscription', async () => {
        const data = randomAddressSubscription();
        const fresh = await dao.createSubscription(
            data.clientId,
            data.projectId,
            data.blockChainId,
            data.networkId,
            data.address,
            data.minConfirmations,
            data.subscribed,
            data.isProjectActive,
            data.isClientActive
        );
        const got = await dao.getById(fresh.id);
        expect(got).toEqual(fresh);
    });
});
