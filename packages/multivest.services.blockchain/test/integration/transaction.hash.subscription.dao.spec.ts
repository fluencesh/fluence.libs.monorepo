import * as config from 'config';
import { Db, MongoClient } from 'mongodb';
import { MongodbTransactionHashSubscriptionDao } from '../../src/dao/mongodb/transaction.hash.subscription.dao';
import { Scheme } from '../../src/types';

import { random } from 'lodash';
import { v1 as generateId } from 'uuid';

import { randomTransactionSubscription } from '../helper';

describe('transaction hash subscription dao', () => {
    let dao: MongodbTransactionHashSubscriptionDao;
    const transactionSubscriptions: Array<Scheme.TransactionHashSubscription> = [];
    const transactionSubscriptionsCount = 15;
    let transactionSubscription: Scheme.TransactionHashSubscription;
    let connection: Db;

    beforeAll(async () => {
        connection = await MongoClient.connect(config.get('multivest.mongodb.url'), {});
        dao = new MongodbTransactionHashSubscriptionDao(connection);
        dao.remove({});

        for (let i = 0; i < transactionSubscriptionsCount; i++) {
            transactionSubscriptions.push(await dao.create(randomTransactionSubscription()));
        }
    });

    beforeEach(() => {
        transactionSubscription = transactionSubscriptions[random(0, transactionSubscriptionsCount - 1)];
    });

    afterAll(async () => {
        await connection.db('multivest').collection('addressSubscriptions').remove({});

        connection.close();
    });

    it('should get by id', async () => {
        const got = await dao.getById(transactionSubscription.id);
        expect(got).toEqual(transactionSubscription);
    });

    it('should get by client id', async () => {
        const filtered = transactionSubscriptions.filter((as) => as.clientId === transactionSubscription.clientId);
        const got = await dao.listByClientId(transactionSubscription.clientId);
        expect(got).toEqual(filtered);
    });

    it('should get by project id', async () => {
        const filtered = transactionSubscriptions.filter((as) => as.projectId === transactionSubscription.projectId);
        const got = await dao.listByProjectId(transactionSubscription.projectId);
        expect(got).toEqual(filtered);
    });

    it('should get by id & project id & client id', async () => {
        const got = await dao.listBySubscribedHash(
            transactionSubscription.hash,
            transactionSubscription.clientId,
            transactionSubscription.projectId
        );

        expect(got).toEqual([transactionSubscription]);
    });

    it('should set new subscriber status', async () => {
        transactionSubscription.subscribed = !transactionSubscription.subscribed;
        await dao.setSubscribed(transactionSubscription.id, transactionSubscription.subscribed);
        const got = await dao.getById(transactionSubscription.id);
        expect(got.subscribed).toEqual(transactionSubscription.subscribed);
    });

    it('should set new is client active status', async () => {
        transactionSubscription.isClientActive = !transactionSubscription.isClientActive;
        await dao.setClientActive(transactionSubscription.clientId, transactionSubscription.isClientActive);
        const got = await dao.listByClientId(transactionSubscription.clientId);

        const filtered = transactionSubscriptions.filter((as) => as.clientId === transactionSubscription.clientId);
        filtered.forEach((as) => {
            as.isClientActive = transactionSubscription.isClientActive;
        });

        expect(got).toEqual(filtered);
    });

    it('should set new is project active status', async () => {
        transactionSubscription.isProjectActive = !transactionSubscription.isProjectActive;
        await dao.setProjectActive(transactionSubscription.projectId, transactionSubscription.isProjectActive);

        const got = await dao.listByProjectId(transactionSubscription.projectId);

        const filtered = transactionSubscriptions.filter((as) => as.projectId === transactionSubscription.projectId);
        filtered.forEach((as) => {
            as.isProjectActive = transactionSubscription.isProjectActive;
        });

        expect(got).toEqual(filtered);
    });

    it('should create subscription', async () => {
        const data = randomTransactionSubscription();
        const created = await dao.createSubscription(
            data.clientId,
            data.projectId,
            data.blockChainId,
            data.networkId,
            data.hash,
            data.minConfirmations,
            data.subscribed,
            data.isProjectActive,
            data.isClientActive
        );

        const got = await dao.getById(created.id);

        expect(got).toEqual(created);
    });
});
